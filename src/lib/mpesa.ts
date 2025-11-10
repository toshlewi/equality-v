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
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    // Use MPESA_BUSINESS_SHORTCODE if available, otherwise fall back to MPESA_SHORTCODE
    this.shortCode = process.env.MPESA_BUSINESS_SHORTCODE || process.env.MPESA_SHORTCODE || '';
    this.passkey = process.env.MPESA_PASSKEY || '';
    this.environment = (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    
    this.baseUrl = this.environment === 'production' 
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('M-Pesa Configuration:', {
        shortCode: this.shortCode ? `${this.shortCode.substring(0, 3)}***` : 'NOT SET',
        hasConsumerKey: !!this.consumerKey,
        hasConsumerSecret: !!this.consumerSecret,
        hasPasskey: !!this.passkey,
        environment: this.environment,
        baseUrl: this.baseUrl
      });
    }
  }

  /**
   * Check if M-Pesa is configured
   */
  isConfigured(): boolean {
    // Check if shortcode is a valid numeric string (M-Pesa shortcodes are numeric)
    const isValidShortCode = this.shortCode && 
      this.shortCode !== 'your_mpesa_shortcode' &&
      /^\d+$/.test(this.shortCode); // Should be numeric only
    
    return !!(
      this.consumerKey && 
      this.consumerKey !== 'your_mpesa_consumer_key' &&
      this.consumerSecret && 
      this.consumerSecret !== 'your_mpesa_consumer_secret' &&
      isValidShortCode &&
      this.passkey && 
      this.passkey !== 'your_mpesa_passkey'
    );
  }

  /**
   * Generate OAuth access token
   */
  async generateAccessToken(): Promise<string> {
    try {
      // Check if credentials are configured
      if (!this.isConfigured()) {
        throw new Error('M-Pesa is not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and MPESA_PASSKEY in your environment variables.');
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = data.errorMessage || data.error_description || data.error || 'Unknown error';
        throw new Error(`Failed to get access token: ${errorMsg}`);
      }

      if (!data.access_token) {
        throw new Error('Access token not received from M-Pesa API');
      }

      return data.access_token;
    } catch (error) {
      console.error('Error generating M-Pesa access token:', error);
      // Re-throw the error with its original message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    // Ensure shortCode is numeric for password generation
    const businessShortCode = this.shortCode.trim();
    if (!/^\d+$/.test(businessShortCode)) {
      throw new Error(`Invalid BusinessShortCode for password generation: ${businessShortCode}. M-Pesa shortcode must be numeric only.`);
    }
    const password = Buffer.from(`${businessShortCode}${this.passkey}${timestamp}`).toString('base64');
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
      // Check if M-Pesa is configured
      if (!this.isConfigured()) {
        throw new Error('M-Pesa is not configured. Please set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and MPESA_PASSKEY in your environment variables.');
      }

      const accessToken = await this.generateAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      // Ensure shortCode is numeric (required by M-Pesa API)
      const businessShortCode = this.shortCode.trim();
      if (!/^\d+$/.test(businessShortCode)) {
        throw new Error(`Invalid BusinessShortCode: ${businessShortCode}. M-Pesa shortcode must be numeric only (e.g., 174379). Current value: "${this.shortCode}". Please check MPESA_BUSINESS_SHORTCODE or MPESA_SHORTCODE in your environment variables.`);
      }

      // Log the shortcode being used (for debugging)
      if (process.env.NODE_ENV === 'development') {
        console.log('M-Pesa STK Push - Using BusinessShortCode:', businessShortCode, 'Type:', typeof businessShortCode);
        console.log('M-Pesa STK Push - Payload:', {
          BusinessShortCode: businessShortCode,
          Amount: Math.round(data.amount),
          PhoneNumber: data.phone,
          AccountReference: data.accountReference
        });
      }

      // Get callback URL - must be publicly accessible HTTPS URL
      const callbackUrl = data.callbackUrl || 
                         process.env.MPESA_CALLBACK_URL || 
                         `${process.env.NEXTAUTH_URL}/api/webhooks/mpesa`;
      
      // Validate callback URL
      if (!callbackUrl || !callbackUrl.startsWith('https://')) {
        throw new Error(`Invalid CallBackURL: ${callbackUrl}. M-Pesa requires a publicly accessible HTTPS URL. Please set MPESA_CALLBACK_URL or NEXTAUTH_URL in your environment variables.`);
      }

      const payload = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount),
        PartyA: data.phone,
        PartyB: businessShortCode,
        PhoneNumber: data.phone,
        CallBackURL: callbackUrl,
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

      // Log the full response in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('M-Pesa STK Push Response:', {
          status: response.status,
          statusText: response.statusText,
          responseCode: result.ResponseCode,
          responseDescription: result.ResponseDescription,
          customerMessage: result.CustomerMessage,
          errorMessage: result.errorMessage,
          error: result.error,
          fullResponse: result
        });
      }

      if (!response.ok) {
        // M-Pesa API returns errorMessage or error_description
        const errorMsg = result.errorMessage || result.error_description || result.error || 'Unknown error';
        throw new Error(`STK Push failed: ${errorMsg}`);
      }

      // Check if M-Pesa API returned an error response code
      if (result.ResponseCode && result.ResponseCode !== '0') {
        throw new Error(`M-Pesa error: ${result.ResponseDescription || result.CustomerMessage || 'Transaction failed'}`);
      }

      return result;
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      // Re-throw the error with its original message if it's already an Error
      if (error instanceof Error) {
        throw error;
      }
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

      // Ensure shortCode is numeric (required by M-Pesa API)
      const businessShortCode = this.shortCode.trim();
      if (!/^\d+$/.test(businessShortCode)) {
        throw new Error(`Invalid BusinessShortCode: ${businessShortCode}. M-Pesa shortcode must be numeric only (e.g., 174379). Please check MPESA_BUSINESS_SHORTCODE or MPESA_SHORTCODE in your environment variables.`);
      }

      const payload = {
        BusinessShortCode: businessShortCode,
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

// Generate access token (alias for generateAccessToken)
export async function generateAccessToken(): Promise<string> {
  return mpesaClient.generateAccessToken();
}

// Generate password (alias for generatePassword)
export function generatePassword(): string {
  return mpesaClient['generatePassword']();
}

export default mpesaClient;
