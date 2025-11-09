import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { initiateSTKPush, mpesaClient } from '@/lib/mpesa';
import { formRateLimit } from '@/middleware/rate-limit';

const stkPushSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  amount: z.number().positive('Amount must be positive'),
  accountReference: z.string().min(1, 'Account reference is required'),
  transactionDesc: z.string().min(1, 'Transaction description is required'),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = formRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = stkPushSchema.parse(body);

    // Check if M-Pesa is configured
    if (!mpesaClient.isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'M-Pesa is not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and MPESA_PASSKEY in your environment variables.' 
        },
        { status: 500 }
      );
    }

    // Format phone number (ensure it starts with country code)
    let phoneNumber = validatedData.phone.trim();
    if (!phoneNumber.startsWith('254')) {
      // Assume Kenyan number, add country code if missing
      if (phoneNumber.startsWith('0')) {
        phoneNumber = '254' + phoneNumber.substring(1);
      } else if (phoneNumber.startsWith('7')) {
        phoneNumber = '254' + phoneNumber;
      } else {
        phoneNumber = '254' + phoneNumber;
      }
    }

    // Get the base URL for callback
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/webhooks/mpesa`;

    // Initiate STK Push
    const stkPushResponse = await initiateSTKPush({
      phone: phoneNumber,
      amount: validatedData.amount,
      accountReference: validatedData.accountReference,
      transactionDesc: validatedData.transactionDesc,
      callbackUrl: callbackUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutRequestId: stkPushResponse.CheckoutRequestID,
        merchantRequestId: stkPushResponse.MerchantRequestID,
        customerMessage: stkPushResponse.CustomerMessage,
        responseCode: stkPushResponse.ResponseCode,
        responseDescription: stkPushResponse.ResponseDescription,
      }
    });
  } catch (error) {
    console.error('STK Push error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to initiate STK Push';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

