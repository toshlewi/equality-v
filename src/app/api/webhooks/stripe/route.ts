import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/stripe';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
import { logSecurityEvent } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received Stripe webhook:', event.type);

    await connectDB();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    
    // Log security event
    await logSecurityEvent('stripe_webhook_error', {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const { metadata } = paymentIntent;
    const { type, memberId, donationId, orderId, registrationId } = metadata;

    if (type === 'membership' && memberId) {
      await handleMembershipPayment(paymentIntent, memberId);
    } else if (type === 'donation' && donationId) {
      await handleDonationPayment(paymentIntent, donationId);
    } else if (type === 'order' && orderId) {
      await handleOrderPayment(paymentIntent, orderId);
    } else if (type === 'event_registration' && registrationId) {
      await handleEventRegistrationPayment(paymentIntent, registrationId);
    }

    // Log successful payment
    await logSecurityEvent('payment_succeeded', {
      success: true,
      resource: type,
      action: 'payment_completed',
      metadata: { paymentIntentId: paymentIntent.id, amount: paymentIntent.amount }
    });

  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

async function handleMembershipPayment(paymentIntent: any, memberId: string) {
  const member = await Member.findById(memberId);
  if (!member) {
    console.error('Member not found:', memberId);
    return;
  }

  // Update member status
  member.paymentStatus = 'paid';
  member.isActive = true;
  member.paymentId = paymentIntent.id;
  member.paymentDate = new Date();
  member.paymentMethod = 'stripe';
  await member.save();

  console.log('Membership activated:', memberId);

  // Get member name (handle legacy fields)
  const memberName = member.firstName && member.lastName
    ? `${member.firstName} ${member.lastName}`
    : (member as any).name || member.email;

  const joinDate = member.joinDate || (member as any).subscriptionStart || new Date();
  const expiryDate = member.expiryDate || (member as any).subscriptionEnd;

  // Send confirmation email
  try {
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: member.email,
      subject: 'Equality Vanguard Membership Confirmed',
      template: 'membership-confirmation',
      data: {
        name: memberName,
        membershipType: member.membershipType,
        joinDate: new Date(joinDate).toLocaleDateString(),
        expiryDate: expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Lifetime',
        amount: member.amount,
        currency: member.currency || 'USD',
        startDate: new Date(joinDate).toLocaleDateString(),
        endDate: expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Lifetime'
      }
    });
  } catch (emailError) {
    console.error('Error sending membership confirmation email:', emailError);
    // Don't fail the webhook if email fails
  }

  // Add to Mailchimp if newsletter is enabled
  if (member.newsletter !== false && process.env.MAILCHIMP_LIST_ID) {
    try {
      const { addSubscriber } = await import('@/lib/mailchimp');
      await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
        email: member.email,
        name: memberName,
        tags: [`member_${member.membershipType}`, 'member'],
        status: 'subscribed'
      });
    } catch (mailchimpError) {
      console.error('Mailchimp error:', mailchimpError);
      // Don't fail the webhook if Mailchimp fails
    }
  }

  // Create admin notification for membership activation
  try {
    const { createAdminNotification } = await import('@/lib/notifications');
    await createAdminNotification({
      type: 'membership_activated',
      title: 'New Membership Activated',
      message: `Membership activated for ${memberName} (${member.membershipType})`,
      metadata: {
        memberId: member._id.toString(),
        memberName: memberName,
        membershipType: member.membershipType,
        amount: member.amount,
        currency: member.currency || 'USD'
      },
      priority: 'medium',
      category: 'members',
      actionUrl: `/admin/members/${member._id}`
    });
  } catch (notificationError) {
    console.error('Error creating admin notification:', notificationError);
    // Don't fail the webhook if notification fails
  }
}

async function handleDonationPayment(paymentIntent: any, donationId: string) {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    console.error('Donation not found:', donationId);
    return;
  }

  // Generate receipt number if not exists
  if (!donation.receiptNumber) {
    donation.receiptNumber = `EV-${donation._id.toString().slice(-8).toUpperCase()}`;
  }

  // Update donation status
  donation.paymentStatus = 'paid';
  donation.status = 'completed';
  donation.paymentId = paymentIntent.id;
  donation.transactionId = paymentIntent.id;
  donation.processedAt = new Date();
  donation.processedBy = 'stripe';
  await donation.save();

  console.log('Donation processed:', donationId);

  // Send receipt email
  try {
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: donation.donorEmail,
      subject: `Donation Receipt - ${donation.receiptNumber}`,
      template: 'donation-receipt',
      data: {
        donorName: donation.donorName,
        amount: donation.amount,
        currency: donation.currency,
        receiptNumber: donation.receiptNumber,
        donationDate: donation.createdAt.toLocaleDateString(),
        taxDeductible: donation.taxDeductible,
        organizationName: 'Equality Vanguard',
        organizationAddress: 'Nairobi, Kenya',
        organizationTaxId: process.env.ORG_TAX_ID || 'N/A'
      }
    });
    donation.receiptSent = true;
    await donation.save();
  } catch (emailError) {
    console.error('Error sending donation receipt:', emailError);
    // Don't fail the webhook if email fails
  }

  // Add to Mailchimp if enabled
  if (process.env.MAILCHIMP_LIST_ID && !donation.isAnonymous) {
    try {
      const { addSubscriber } = await import('@/lib/mailchimp');
      await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
        email: donation.donorEmail,
        name: donation.donorName,
        tags: ['donor', 'donation'],
        status: 'subscribed'
      });
    } catch (mailchimpError) {
      console.error('Mailchimp error:', mailchimpError);
      // Don't fail the webhook if Mailchimp fails
    }
  }

  // Create admin notification for donation payment success
  try {
    const { createAdminNotification } = await import('@/lib/notifications');
    await createAdminNotification({
      type: 'donation_paid',
      title: 'Donation Payment Received',
      message: `Donation payment of ${donation.currency || 'USD'}${donation.amount} from ${donation.isAnonymous ? 'Anonymous' : donation.donorName} has been received`,
      metadata: {
        donationId: donation._id.toString(),
        donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
        amount: donation.amount,
        currency: donation.currency || 'USD',
        receiptNumber: donation.receiptNumber,
        paymentMethod: donation.paymentMethod
      },
      priority: 'medium',
      category: 'donations',
      actionUrl: `/admin/payments/donations/${donation._id}`
    });
  } catch (notificationError) {
    console.error('Error creating admin notification:', notificationError);
    // Don't fail the webhook if notification fails
  }
}

async function handleOrderPayment(paymentIntent: any, orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  // Update order status
  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.paymentId = paymentIntent.id;
  order.paidAt = new Date();
  await order.save();

  console.log('Order confirmed:', orderId);

  // Send order confirmation email
  try {
    const { sendEmail } = await import('@/lib/email');
    
    // Format shipping address
    const shippingAddress = order.customerInfo.shippingAddress
      ? `${order.customerInfo.shippingAddress.street || ''}, ${order.customerInfo.shippingAddress.city || ''}, ${order.customerInfo.shippingAddress.state || ''} ${order.customerInfo.shippingAddress.postalCode || ''}, ${order.customerInfo.shippingAddress.country || ''}`
      : order.customerInfo.billingAddress
      ? `${order.customerInfo.billingAddress.street || ''}, ${order.customerInfo.billingAddress.city || ''}, ${order.customerInfo.billingAddress.state || ''} ${order.customerInfo.billingAddress.postalCode || ''}, ${order.customerInfo.billingAddress.country || ''}`
      : undefined;
    
    await sendEmail({
      to: order.customerInfo.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: 'order-confirmation',
      data: {
        customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
        orderNumber: order.orderNumber,
        items: order.items || [],
        subtotal: order.subtotal,
        shipping: order.shipping || 0,
        tax: order.tax || 0,
        total: order.total,
        currency: order.currency || 'USD',
        shippingAddress
      }
    });

    // Track email sent
    order.emailsSent = order.emailsSent || [];
    order.emailsSent.push({
      type: 'confirmation',
      sentAt: new Date()
    });
    await order.save();
  } catch (emailError) {
    console.error('Error sending order confirmation email:', emailError);
    // Don't fail the webhook if email fails
  }

  // Update inventory
  try {
    const Product = await import('@/models/Product').then(m => m.default);
    for (const item of order.items || []) {
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.inventory?.trackQuantity) {
          product.inventory.quantity = Math.max(0, (product.inventory.quantity || 0) - item.quantity);
          await product.save();
        }
      }
    }
  } catch (inventoryError) {
    console.error('Error updating inventory:', inventoryError);
    // Don't fail the webhook if inventory update fails
  }

  // Create admin notification
  try {
    const { createAdminNotification } = await import('@/lib/notifications');
    await createAdminNotification({
      type: 'order_confirmed',
      title: 'New Order Confirmed',
      message: `New order ${order.orderNumber} from ${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerInfo.email,
        total: order.total,
        currency: order.currency
      },
      priority: 'medium',
      category: 'orders',
      actionUrl: `/admin/shop/orders/${order._id}`
    });
  } catch (notificationError) {
    console.error('Error creating admin notification:', notificationError);
  }
}

async function handleEventRegistrationPayment(paymentIntent: any, registrationId: string) {
  const EventRegistration = await import('@/models/EventRegistration').then(m => m.default);
  const Event = await import('@/models/Event').then(m => m.default);
  
  const registration = await EventRegistration.findById(registrationId).populate('eventId');
  if (!registration) {
    console.error('Event registration not found:', registrationId);
    return;
  }

  const event = registration.eventId as any;
  if (!event) {
    console.error('Event not found for registration:', registrationId);
    return;
  }

  // Update registration status
  registration.paymentStatus = 'paid';
  registration.status = 'confirmed';
  registration.paymentId = paymentIntent.id;
  registration.transactionId = paymentIntent.id;
  registration.updatedAt = new Date();
  await registration.save();

  // Update event registration count
  event.registeredCount = (event.registeredCount || 0) + registration.ticketCount;
  await event.save();

  console.log('Event registration confirmed:', registrationId);

  // Generate ICS file and send confirmation email
  try {
    const { generateICSFile } = await import('@/lib/calendar');
    const icsFile = generateICSFile({
      title: event.title,
      description: event.description || event.shortDescription || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location?.isVirtual 
        ? event.location.virtualLink || event.location.name || ''
        : event.location?.address || event.location?.name || '',
      organizer: event.organizer ? {
        name: event.organizer.name || 'Equality Vanguard',
        email: event.organizer.email || 'events@equalityvanguard.org'
      } : {
        name: 'Equality Vanguard',
        email: 'events@equalityvanguard.org'
      },
      attendee: {
        name: registration.attendeeName,
        email: registration.attendeeEmail
      },
      url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
      uid: `event-reg-${registration._id.toString()}`
    });

    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: registration.attendeeEmail,
      subject: `Event Registration Confirmed - ${event.title}`,
      template: 'event-registration',
      data: {
        name: registration.attendeeName,
        eventTitle: event.title,
        eventDate: new Date(event.startDate).toLocaleDateString(),
        eventTime: event.startTime || '',
        eventLocation: event.location?.isVirtual 
          ? event.location.virtualLink || 'Virtual Event'
          : event.location?.address || event.location?.name || 'TBA',
        ticketCount: registration.ticketCount,
        confirmationCode: registration.confirmationCode,
        amount: registration.amount,
        currency: registration.currency
      },
      attachments: [{
        filename: icsFile.filename,
        data: icsFile.buffer,
        contentType: 'text/calendar'
      }]
    });

    registration.confirmationEmailSent = true;
    registration.confirmationEmailSentAt = new Date();
    await registration.save();
  } catch (emailError) {
    console.error('Error sending event registration confirmation:', emailError);
    // Don't fail the webhook if email fails
  }

  // Add to Mailchimp if enabled
  if (process.env.MAILCHIMP_LIST_ID) {
    try {
      const { addSubscriber } = await import('@/lib/mailchimp');
      await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
        email: registration.attendeeEmail,
        name: registration.attendeeName,
        tags: ['event_attendee', event.category || 'event'],
        status: 'subscribed'
      });
    } catch (mailchimpError) {
      console.error('Mailchimp error:', mailchimpError);
      // Don't fail the webhook if Mailchimp fails
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const { metadata } = paymentIntent;
    const { type, memberId, donationId, orderId, registrationId } = metadata;

    if (type === 'membership' && memberId) {
      const member = await Member.findById(memberId);
      if (member) {
        member.paymentStatus = 'failed';
        member.paymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
        await member.save();
      }
    } else if (type === 'donation' && donationId) {
      const donation = await Donation.findById(donationId);
      if (donation) {
        donation.paymentStatus = 'failed';
        donation.status = 'failed';
        donation.paymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
        await donation.save();
      }
    } else if (type === 'order' && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'failed';
        order.status = 'failed';
        order.paymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
        await order.save();
      }
    } else if (type === 'event_registration' && registrationId) {
      const EventRegistration = await import('@/models/EventRegistration').then(m => m.default);
      const registration = await EventRegistration.findById(registrationId);
      if (registration) {
        registration.paymentStatus = 'failed';
        registration.status = 'pending';
        await registration.save();
      }
    }

    // Log failed payment
    await logSecurityEvent('payment_failed', {
      success: false,
      resource: type,
      action: 'payment_failed',
      error: paymentIntent.last_payment_error?.message || 'Payment failed',
      metadata: { paymentIntentId: paymentIntent.id }
    });

  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}

async function handleChargeRefunded(charge: any) {
  try {
    const { metadata } = charge;
    const { type, memberId, donationId, orderId } = metadata;

    if (type === 'membership' && memberId) {
      const member = await Member.findById(memberId);
      if (member) {
        member.paymentStatus = 'refunded';
        member.isActive = false;
        await member.save();
      }
    } else if (type === 'donation' && donationId) {
      const donation = await Donation.findById(donationId);
      if (donation) {
        donation.paymentStatus = 'refunded';
        donation.status = 'refunded';
        await donation.save();
      }
    } else if (type === 'order' && orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
        await order.save();
      }
    }

    // Log refund
    await logSecurityEvent('payment_refunded', {
      success: true,
      resource: type,
      action: 'refund_processed',
      metadata: { chargeId: charge.id, amount: charge.amount_refunded }
    });

  } catch (error) {
    console.error('Error handling charge refunded:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription: any) {
  // Handle subscription creation
  console.log('Subscription created:', subscription.id);
  // TODO: Implement subscription handling
}

async function handleSubscriptionUpdated(subscription: any) {
  // Handle subscription updates
  console.log('Subscription updated:', subscription.id);
  // TODO: Implement subscription update handling
}

async function handleSubscriptionDeleted(subscription: any) {
  // Handle subscription cancellation
  console.log('Subscription deleted:', subscription.id);
  // TODO: Implement subscription cancellation handling
}
