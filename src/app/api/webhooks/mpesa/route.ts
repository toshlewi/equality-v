import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyCallback, extractTransactionDetails } from '@/lib/mpesa';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
import { logSecurityEvent } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-callback-signature');

    // Verify callback authenticity
    const isValidCallback = verifyCallback(body, signature || '');
    if (!isValidCallback) {
      console.error('Invalid M-Pesa callback signature');
      return NextResponse.json(
        { error: 'Invalid callback signature' },
        { status: 400 }
      );
    }

    console.log('Received M-Pesa callback:', JSON.stringify(body, null, 2));

    await connectDB();

    // Extract transaction details
    const transactionDetails = extractTransactionDetails(body);

    if (transactionDetails.success) {
      // Ensure all required fields are present
      if (transactionDetails.transactionId && transactionDetails.amount && transactionDetails.phone && transactionDetails.accountReference) {
        await handleSuccessfulPayment({
          transactionId: transactionDetails.transactionId,
          amount: transactionDetails.amount,
          phone: transactionDetails.phone,
          accountReference: transactionDetails.accountReference,
          resultCode: transactionDetails.resultCode,
          resultDesc: transactionDetails.resultDesc
        });
      } else {
        console.error('Missing required transaction details:', transactionDetails);
        await logSecurityEvent({
          type: 'mpesa_webhook_error',
          userId: undefined,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          details: { error: 'Missing required transaction details', transactionDetails },
          severity: 'high'
        });
      }
    } else {
      await handleFailedPayment(transactionDetails);
    }

    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully'
    });

  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    
    // Log security event
    await logSecurityEvent({
      type: 'mpesa_webhook_error',
      userId: undefined,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'high'
    });

    return NextResponse.json(
      { 
        ResultCode: 1,
        ResultDesc: 'Callback processing failed'
      },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(transactionDetails: {
  transactionId: string;
  amount: number;
  phone: string;
  accountReference: string;
  resultCode: number;
  resultDesc: string;
}) {
  try {
    const { transactionId, amount, phone, accountReference } = transactionDetails;

    // Parse account reference to determine type and ID
    // Format: "type_id" (e.g., "membership_64f8a1b2c3d4e5f6a7b8c9d0")
    const [type, id] = accountReference.split('_');
    
    if (type === 'membership' && id) {
      await handleMembershipPayment(transactionId, amount, phone, id);
    } else if (type === 'donation' && id) {
      await handleDonationPayment(transactionId, amount, phone, id);
    } else if (type === 'order' && id) {
      await handleOrderPayment(transactionId, amount, phone, id);
    } else {
      console.error('Unknown account reference type:', type);
    }

    // Log successful payment
    await logSecurityEvent({
      type: 'mpesa_payment_succeeded',
      userId: undefined,
      ip: 'unknown',
      userAgent: 'unknown',
      details: {
        success: true,
        resource: type,
        action: 'payment_completed',
        metadata: { 
          transactionId, 
          amount, 
          phone,
          accountReference 
        }
      },
      severity: 'low'
    });

  } catch (error) {
    console.error('Error handling successful M-Pesa payment:', error);
    throw error;
  }
}

async function handleMembershipPayment(
  transactionId: string, 
  amount: number, 
  phone: string, 
  memberId: string
) {
  const member = await Member.findById(memberId);
  if (!member) {
    console.error('Member not found:', memberId);
    return;
  }

  // Verify payment amount matches expected amount (M-Pesa amounts are in KSh)
  // Convert to USD if needed (assuming 1 USD = 100 KSh, adjust as needed)
  const expectedAmount = member.amount;
  const paidAmount = amount; // M-Pesa amount in KSh
  
  // Allow for currency conversion (assuming 1 USD = 100 KSh)
  // You may need to adjust this conversion rate
  const conversionRate = 100; // 1 USD = 100 KSh
  const expectedAmountInKSh = expectedAmount * conversionRate;
  
  // Allow small rounding differences (e.g., KSh 10)
  if (Math.abs(paidAmount - expectedAmountInKSh) > 10) {
    console.error(`Payment amount mismatch for member ${memberId}. Expected: ${expectedAmountInKSh} KSh, Received: ${paidAmount} KSh`);
    // Don't activate membership if amount doesn't match
    member.paymentStatus = 'failed';
    member.paymentError = `Payment amount mismatch. Expected: ${expectedAmountInKSh} KSh, Received: ${paidAmount} KSh`;
    await member.save();
    return;
  }

  // Only activate membership after payment is verified
  member.paymentStatus = 'paid';
  member.status = 'active'; // Set status to active
  member.isActive = true;
  member.paymentId = transactionId;
  member.paymentDate = new Date();
  member.paymentMethod = 'mpesa';
  member.paymentPhone = phone;
  await member.save();

  console.log('Membership activated via M-Pesa:', memberId);

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
        amount: paidAmount,
        currency: 'KES',
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
        tags: [`member_${member.membershipType}`, 'member', 'mpesa'],
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
      title: 'New Membership Activated (M-Pesa)',
      message: `Membership activated for ${memberName} (${member.membershipType}) via M-Pesa`,
      metadata: {
        memberId: member._id.toString(),
        memberName: memberName,
        membershipType: member.membershipType,
        amount: paidAmount,
        currency: 'KES',
        paymentMethod: 'mpesa',
        transactionId: transactionId
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

async function handleDonationPayment(
  transactionId: string, 
  amount: number, 
  phone: string, 
  donationId: string
) {
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
  donation.paymentId = transactionId;
  donation.transactionId = transactionId;
  donation.processedAt = new Date();
  donation.processedBy = 'mpesa';
  donation.paymentPhone = phone;
  await donation.save();

  console.log('Donation processed via M-Pesa:', donationId);

  // Send receipt email
  try {
    const { sendEmail } = await import('@/lib/email');
    await sendEmail({
      to: donation.donorEmail,
      subject: `Donation Receipt - ${donation.receiptNumber}`,
      template: 'donation-receipt',
      data: {
        donorName: donation.donorName,
        amount: amount,
        currency: 'KES',
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
        tags: ['donor', 'donation', 'mpesa'],
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
      title: 'Donation Payment Received (M-Pesa)',
      message: `Donation payment of KES ${amount} from ${donation.isAnonymous ? 'Anonymous' : donation.donorName} has been received via M-Pesa`,
      metadata: {
        donationId: donation._id.toString(),
        donorName: donation.isAnonymous ? 'Anonymous' : donation.donorName,
        amount: amount,
        currency: 'KES',
        receiptNumber: donation.receiptNumber,
        paymentMethod: 'mpesa',
        transactionId: transactionId
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

async function handleOrderPayment(
  transactionId: string, 
  amount: number, 
  phone: string, 
  orderId: string
) {
  const order = await Order.findById(orderId);
  if (!order) {
    console.error('Order not found:', orderId);
    return;
  }

  // Update order status
  order.paymentStatus = 'paid';
  order.status = 'confirmed';
  order.paymentId = transactionId;
  order.paidAt = new Date();
  order.paymentPhone = phone;
  await order.save();

  console.log('Order confirmed via M-Pesa:', orderId);

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
        currency: 'KES',
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
      title: 'New Order Confirmed (M-Pesa)',
      message: `New order ${order.orderNumber} from ${order.customerInfo.firstName} ${order.customerInfo.lastName} via M-Pesa`,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: order.customerInfo.email,
        total: order.total,
        currency: 'KES',
        paymentMethod: 'mpesa',
        transactionId: transactionId
      },
      priority: 'medium',
      category: 'orders',
      actionUrl: `/admin/shop/orders/${order._id}`
    });
  } catch (notificationError) {
    console.error('Error creating admin notification:', notificationError);
  }
}

async function handleFailedPayment(transactionDetails: {
  resultCode: number;
  resultDesc: string;
}) {
  try {
    const { resultCode, resultDesc } = transactionDetails;

    // Log failed payment
    await logSecurityEvent({
      type: 'mpesa_payment_failed',
      userId: undefined,
      ip: 'unknown',
      userAgent: 'unknown',
      details: {
        success: false,
        action: 'payment_failed',
        error: resultDesc,
        metadata: { resultCode }
      },
      severity: 'medium'
    });

    console.log('M-Pesa payment failed:', resultDesc);

  } catch (error) {
    console.error('Error handling failed M-Pesa payment:', error);
    throw error;
  }
}
