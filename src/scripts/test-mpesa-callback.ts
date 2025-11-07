// Test script to simulate M-Pesa callback locally
// Run: npm run test:mpesa-callback or tsx src/scripts/test-mpesa-callback.ts

require('dotenv').config({ path: '.env.local' });
import { connectDB } from '../lib/mongodb';
import Member from '../models/Member';
import Donation from '../models/Donation';
import Order from '../models/Order';

// Simulate an M-Pesa STK Push callback
async function simulateMpesaCallback() {
  try {
    await connectDB();
    console.log('🔗 Connected to database\n');

    // Get a test member/donation/order from database
    const testMember = await Member.findOne({ paymentMethod: 'mpesa', paymentStatus: 'pending' });
    const testDonation = await Donation.findOne({ paymentMethod: 'mpesa', status: 'pending' });
    const testOrder = await Order.findOne({ paymentMethod: 'mpesa', paymentStatus: 'pending' });

    if (!testMember && !testDonation && !testOrder) {
      console.log('⚠️  No pending M-Pesa payments found in database.');
      console.log('   Create a test membership/donation/order with M-Pesa payment first.\n');
      return;
    }

    // Determine type and ID
    const entity = testMember || testDonation || testOrder;
    const type = testMember ? 'membership' : testDonation ? 'donation' : 'order';
    const accountReference = `${type}_${entity!._id.toString()}`;

    // Simulate successful M-Pesa callback
    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: `test_merchant_${Date.now()}`,
          CheckoutRequestID: entity!.paymentId || `test_checkout_${Date.now()}`,
          ResultCode: 0, // 0 = success
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: entity!.amount || 5000 },
              { Name: 'MpesaReceiptNumber', Value: `TEST${Date.now()}` },
              { Name: 'TransactionDate', Value: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3) },
              { Name: 'PhoneNumber', Value: '254712345678' }
            ]
          }
        }
      }
    };

    console.log('📤 Simulating M-Pesa callback...\n');
    console.log('Account Reference:', accountReference);
    console.log('Amount:', callbackPayload.Body.stkCallback.CallbackMetadata.Item.find((i: any) => i.Name === 'Amount')?.Value);
    console.log('Result Code:', callbackPayload.Body.stkCallback.ResultCode);
    console.log('Result Description:', callbackPayload.Body.stkCallback.ResultDesc);
    console.log('');

    // Make actual callback to local endpoint
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/webhooks/mpesa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-callback-signature': 'test_signature'
      },
      body: JSON.stringify(callbackPayload)
    });

    const result = await response.json();
    
    if (response.ok && result.ResultCode === 0) {
      console.log('✅ Callback processed successfully');
      console.log('Response:', result);
    } else {
      console.log('❌ Callback processing failed');
      console.log('Error:', result);
    }

    // Check database status
    if (testMember) {
      await testMember.reload();
      console.log('\n📊 Member Status:');
      console.log('  Payment Status:', testMember.paymentStatus);
      console.log('  Member Status:', testMember.status);
      console.log('  Is Active:', testMember.isActive);
    }

    if (testDonation) {
      await testDonation.reload();
      console.log('\n📊 Donation Status:');
      console.log('  Status:', testDonation.status);
    }

    if (testOrder) {
      await testOrder.reload();
      console.log('\n📊 Order Status:');
      console.log('  Payment Status:', testOrder.paymentStatus);
      console.log('  Order Status:', testOrder.status);
    }

  } catch (error) {
    console.error('❌ Error simulating callback:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

// Run simulation
simulateMpesaCallback();




