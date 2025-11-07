// Test script to test Mailgun email delivery
// Run: npm run test:email or tsx src/scripts/test-email-sending.ts

require('dotenv').config({ path: '.env.local' });
import { sendEmail } from '../lib/email';

async function testEmailSending() {
  try {
    console.log('📧 Testing Mailgun email delivery...\n');

    // Check if Mailgun is configured
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.log('⚠️  Mailgun not configured.');
      console.log('   Set MAILGUN_API_KEY and MAILGUN_DOMAIN in .env.local\n');
      return;
    }

    const testEmail = process.env.ADMIN_EMAIL || 'test@example.com';
    console.log('Sending test email to:', testEmail);
    console.log('');

    // Test 1: Membership confirmation email
    console.log('Test 1: Membership Confirmation Email');
    const membershipResult = await sendEmail({
      to: testEmail,
      subject: 'Test: Membership Confirmation - Equality Vanguard',
      template: 'membership-confirmation',
      data: {
        name: 'Test User',
        membershipType: 'annual',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        amount: 5000,
        currency: 'KES'
      }
    });

    if (membershipResult.success) {
      console.log('✅ Membership confirmation email sent');
      console.log('   Message ID:', membershipResult.messageId);
    } else {
      console.log('❌ Failed to send membership confirmation email');
      console.log('   Error:', membershipResult.error);
    }
    console.log('');

    // Test 2: Donation receipt email
    console.log('Test 2: Donation Receipt Email');
    const donationResult = await sendEmail({
      to: testEmail,
      subject: 'Test: Donation Receipt - Equality Vanguard',
      template: 'donation-receipt',
      data: {
        donorName: 'Test Donor',
        amount: 50,
        currency: 'USD',
        donationType: 'cash',
        transactionId: 'test_txn_123',
        date: new Date()
      }
    });

    if (donationResult.success) {
      console.log('✅ Donation receipt email sent');
      console.log('   Message ID:', donationResult.messageId);
    } else {
      console.log('❌ Failed to send donation receipt email');
      console.log('   Error:', donationResult.error);
    }
    console.log('');

    // Test 3: Event registration email with .ics attachment
    console.log('Test 3: Event Registration Email with Calendar Invite');
    const { generateICSBuffer } = await import('../lib/calendar');
    
    const icsBuffer = generateICSBuffer({
      title: 'Test Event - Equality Vanguard',
      description: 'This is a test event',
      location: 'Online',
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      organizer: { name: 'Equality Vanguard', email: process.env.MAILGUN_FROM_EMAIL || 'noreply@equalityvanguard.org' }
    });

    const eventResult = await sendEmail({
      to: testEmail,
      subject: 'Test: Event Registration Confirmed - Equality Vanguard',
      template: 'event-registration',
      data: {
        eventTitle: 'Test Event',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        eventLocation: 'Online',
        attendeeName: 'Test Attendee'
      },
      attachments: [
        {
          filename: 'event.ics',
          data: icsBuffer,
          contentType: 'text/calendar'
        }
      ]
    });

    if (eventResult.success) {
      console.log('✅ Event registration email sent with .ics attachment');
      console.log('   Message ID:', eventResult.messageId);
    } else {
      console.log('❌ Failed to send event registration email');
      console.log('   Error:', eventResult.error);
    }
    console.log('');

    // Test 4: Admin notification email
    console.log('Test 4: Admin Notification Email');
    const adminResult = await sendEmail({
      to: testEmail,
      subject: 'Test: New Membership Signup - Equality Vanguard',
      template: 'admin-notification',
      data: {
        type: 'membership_created',
        title: 'New Membership Signup',
        message: 'Test User (test@example.com) has signed up for annual membership',
        metadata: {
          memberId: 'test_member_123',
          membershipType: 'annual',
          amount: 5000
        },
        actionUrl: '/admin/members/test_member_123'
      }
    });

    if (adminResult.success) {
      console.log('✅ Admin notification email sent');
      console.log('   Message ID:', adminResult.messageId);
    } else {
      console.log('❌ Failed to send admin notification email');
      console.log('   Error:', adminResult.error);
    }
    console.log('');

    console.log('=============================================================================');
    console.log('📊 Email Test Summary');
    console.log('=============================================================================');
    console.log('Check your inbox at:', testEmail);
    console.log('Check Mailgun Dashboard → Logs for delivery status');
    console.log('');

  } catch (error) {
    console.error('❌ Error testing email:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

// Run test
testEmailSending();




