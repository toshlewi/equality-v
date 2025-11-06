import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { queryTransactionStatus } from '@/lib/mpesa';
import { formRateLimit } from '@/middleware/rate-limit';

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = formRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const checkoutRequestId = searchParams.get('checkoutRequestId');

    if (!checkoutRequestId) {
      return NextResponse.json(
        { success: false, error: 'checkoutRequestId is required' },
        { status: 400 }
      );
    }

    // Query transaction status
    const queryResponse = await queryTransactionStatus(checkoutRequestId);

    // Extract relevant information
    const resultCode = queryResponse.ResultCode;
    const resultDesc = queryResponse.ResultDesc;
    const checkoutRequestID = queryResponse.CheckoutRequestID;
    const merchantRequestID = queryResponse.MerchantRequestID;

    // If successful, extract transaction details
    let transactionDetails = null;
    if (resultCode === 0 && queryResponse.CallbackMetadata) {
      const items = queryResponse.CallbackMetadata.Item || [];
      transactionDetails = {
        mpesaReceiptNumber: items.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value,
        amount: items.find((item: any) => item.Name === 'Amount')?.Value,
        phoneNumber: items.find((item: any) => item.Name === 'PhoneNumber')?.Value,
        accountReference: items.find((item: any) => item.Name === 'AccountReference')?.Value,
        transactionDate: items.find((item: any) => item.Name === 'TransactionDate')?.Value,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        resultCode,
        resultDesc,
        checkoutRequestID,
        merchantRequestID,
        transactionDetails,
      }
    });
  } catch (error) {
    console.error('Query transaction status error:', error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to query transaction status';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}



