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

  // TODO: Send confirmation SMS
  // TODO: Send confirmation email
  // TODO: Add to Mailchimp
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

  // Update donation status
  donation.paymentStatus = 'paid';
  donation.status = 'completed';
  donation.paymentId = transactionId;
  donation.processedAt = new Date();
  donation.processedBy = 'mpesa';
  donation.paymentPhone = phone;
  await donation.save();

  console.log('Donation processed via M-Pesa:', donationId);

  // TODO: Send receipt SMS
  // TODO: Send receipt email
  // TODO: Add to Mailchimp
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

  // TODO: Send order confirmation SMS
  // TODO: Send order confirmation email
  // TODO: Update inventory
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
