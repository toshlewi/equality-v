import crypto from 'crypto';

export interface STKPushData {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

class MpesaClient {
  private consumerKey: string;
  private consumerSecret: string;
  private shortCode: string;
  private passkey: string;
  private environment: 'sandbox' | 'production';
  private baseUrl: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.shortCode = process.env.MPESA_SHORTCODE!;
    this.passkey = process.env.MPESA_PASSKEY!;
    this.environment = (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Generate OAuth access token
   */
  async generateAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.errorMessage || 'Unknown error'}`);
      }

      return data.access_token;
    } catch (error) {
      console.error('Error generating M-Pesa access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString('base64');
    return password;
  }

  /**
   * Generate timestamp for M-Pesa API
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  /**
   * Initiate STK Push
   */
  async initiateSTKPush(data: STKPushData): Promise<STKPushResponse> {
    try {
      const accessToken = await this.generateAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount),
        PartyA: data.phone,
        PartyB: this.shortCode,
        PhoneNumber: data.phone,
        CallBackURL: data.callbackUrl || `${process.env.NEXTAUTH_URL}/api/webhooks/mpesa`,
        AccountReference: data.accountReference,
        TransactionDesc: data.transactionDesc,
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`STK Push failed: ${result.errorMessage || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      throw new Error('Failed to initiate STK Push');
    }
  }

  /**
   * Query transaction status
   */
  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.generateAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Query failed: ${result.errorMessage || 'Unknown error'}`);
      }

      return result;
    } catch (error) {
      console.error('Error querying transaction status:', error);
      throw new Error('Failed to query transaction status');
    }
  }

  /**
   * Verify callback authenticity
   */
  verifyCallback(callbackData: any, signature: string): boolean {
    try {
      // In production, you should verify the signature from M-Pesa
      // For now, we'll do basic validation
      return callbackData && callbackData.Body && callbackData.Body.stkCallback;
    } catch (error) {
      console.error('Error verifying callback:', error);
      return false;
    }
  }

  /**
   * Extract transaction details from callback
   */
  extractTransactionDetails(callbackData: MpesaCallbackData): {
    success: boolean;
    transactionId?: string;
    amount?: number;
    phone?: string;
    accountReference?: string;
    resultCode: number;
    resultDesc: string;
  } {
    const stkCallback = callbackData.Body.stkCallback;
    
    if (stkCallback.ResultCode === 0) {
      // Success
      const metadata = stkCallback.CallbackMetadata?.Item || [];
      const transactionId = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find(item => item.Name === 'Amount')?.Value;
      const phone = metadata.find(item => item.Name === 'PhoneNumber')?.Value;
      const accountReference = metadata.find(item => item.Name === 'AccountReference')?.Value;

      return {
        success: true,
        transactionId: transactionId as string,
        amount: amount as number,
        phone: phone as string,
        accountReference: accountReference as string,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      };
    } else {
      // Failed
      return {
        success: false,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc
      };
    }
  }

  /**
   * Generate M-Pesa receipt
   */
  generateReceipt(transactionDetails: {
    transactionId: string;
    amount: number;
    phone: string;
    accountReference: string;
    timestamp: Date;
  }): string {
    const receipt = `
M-PESA RECEIPT
Transaction ID: ${transactionDetails.transactionId}
Amount: KES ${transactionDetails.amount}
Phone: ${transactionDetails.phone}
Account: ${transactionDetails.accountReference}
Time: ${transactionDetails.timestamp.toLocaleString()}
Status: Success

Thank you for your payment!
    `.trim();

    return receipt;
  }
}

// Export singleton instance
export const mpesaClient = new MpesaClient();

// Export individual functions for convenience
export async function initiateSTKPush(data: STKPushData): Promise<STKPushResponse> {
  return mpesaClient.initiateSTKPush(data);
}

export async function queryTransactionStatus(checkoutRequestId: string): Promise<any> {
  return mpesaClient.queryTransactionStatus(checkoutRequestId);
}

export function verifyCallback(callbackData: any, signature: string): boolean {
  return mpesaClient.verifyCallback(callbackData, signature);
}

export function extractTransactionDetails(callbackData: MpesaCallbackData): {
  success: boolean;
  transactionId?: string;
  amount?: number;
  phone?: string;
  accountReference?: string;
  resultCode: number;
  resultDesc: string;
} {
  return mpesaClient.extractTransactionDetails(callbackData);
}

export function generateReceipt(transactionDetails: {
  transactionId: string;
  amount: number;
  phone: string;
  accountReference: string;
  timestamp: Date;
}): string {
  return mpesaClient.generateReceipt(transactionDetails);
}

export default mpesaClient;
