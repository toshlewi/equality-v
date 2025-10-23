import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyWebhookSignature } from '@/lib/stripe';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
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
    const { type, memberId, donationId, orderId } = metadata;

    if (type === 'membership' && memberId) {
      await handleMembershipPayment(paymentIntent, memberId);
    } else if (type === 'donation' && donationId) {
      await handleDonationPayment(paymentIntent, donationId);
    } else if (type === 'order' && orderId) {
      await handleOrderPayment(paymentIntent, orderId);
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

  // TODO: Send confirmation email
  // TODO: Add to Mailchimp
}

async function handleDonationPayment(paymentIntent: any, donationId: string) {
  const donation = await Donation.findById(donationId);
  if (!donation) {
    console.error('Donation not found:', donationId);
    return;
  }

  // Update donation status
  donation.paymentStatus = 'paid';
  donation.status = 'completed';
  donation.paymentId = paymentIntent.id;
  donation.processedAt = new Date();
  donation.processedBy = 'stripe';
  await donation.save();

  console.log('Donation processed:', donationId);

  // TODO: Send receipt email
  // TODO: Add to Mailchimp
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

  // TODO: Send order confirmation email
  // TODO: Update inventory
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const { metadata } = paymentIntent;
    const { type, memberId, donationId, orderId } = metadata;

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
