// Test script to test Mailchimp API integration
// Run: npm run test:mailchimp or tsx src/scripts/test-mailchimp-api.ts

require('dotenv').config({ path: '.env.local' });
import { addSubscriber, removeSubscriber, getSubscriberHash, addTags } from '../lib/mailchimp';

async function testMailchimpAPI() {
  try {
    console.log('📬 Testing Mailchimp API integration...\n');

    // Check if Mailchimp is configured
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
      console.log('⚠️  Mailchimp not configured.');
      console.log('   Set MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID in .env.local\n');
      return;
    }

    const testEmail = `test_${Date.now()}@example.com`;
    const testName = 'Test User';
    console.log('Using test email:', testEmail);
    console.log('');

    // Test 1: Add subscriber
    console.log('Test 1: Add Subscriber');
    const addResult = await addSubscriber(process.env.MAILCHIMP_LIST_ID!, {
      email: testEmail,
      name: testName,
      tags: ['test', 'member_1yr'],
      mergeFields: {
        FNAME: 'Test',
        LNAME: 'User'
      },
      status: 'subscribed'
    });

    if (addResult.success) {
      console.log('✅ Subscriber added successfully');
      console.log('   Subscriber ID:', addResult.memberId);
    } else {
      console.log('❌ Failed to add subscriber');
      console.log('   Error:', addResult.error);
      return;
    }
    console.log('');

    // Wait a bit for Mailchimp to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Add subscriber tags
    console.log('Test 2: Add Subscriber Tags');
    const subscriberHash = getSubscriberHash(testEmail);
    const tagResult = await addTags(process.env.MAILCHIMP_LIST_ID!, subscriberHash, ['test', 'member_1yr', 'active_member']);
    
    if (tagResult.success) {
      console.log('✅ Tags added successfully');
    } else {
      console.log('❌ Failed to add tags');
      console.log('   Error:', tagResult.error);
    }
    console.log('');

    // Test 3: Remove subscriber (unsubscribe)
    console.log('Test 3: Remove Subscriber (Unsubscribe)');
    const removeResult = await removeSubscriber(process.env.MAILCHIMP_LIST_ID!, subscriberHash);

    if (removeResult.success) {
      console.log('✅ Subscriber removed successfully');
    } else {
      console.log('❌ Failed to remove subscriber');
      console.log('   Error:', removeResult.error);
    }
    console.log('');

    console.log('=============================================================================');
    console.log('📊 Mailchimp Test Summary');
    console.log('=============================================================================');
    console.log('Check Mailchimp Dashboard → Audience → All contacts');
    console.log('Look for:', testEmail);
    console.log('');

  } catch (error) {
    console.error('❌ Error testing Mailchimp:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    process.exit(0);
  }
}

// Run test
testMailchimpAPI();

