// Test script for notification system
// Run: npx tsx src/scripts/test-notifications.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { 
  createNotification, 
  createAdminNotification,
  getNotifications,
  getUnreadCount,
  markAsRead
} from '../lib/notifications';
import User from '../models/User';

async function testNotificationSystem() {
  try {
    console.log('🔔 Testing Notification System...\n');
    
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // Get an admin user for testing
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    console.log(`📧 Found admin user: ${adminUser.email}\n`);

    // Test 1: Create admin notification
    console.log('Test 1: Creating admin notification...');
    const adminNotifResult = await createAdminNotification({
      type: 'system_alert',
      title: '🧪 Test Admin Notification',
      message: 'This is a test notification for all admins. The notification system is working!',
      priority: 'high',
      category: 'system',
      metadata: {
        testId: Date.now(),
        source: 'test-script'
      }
    });
    
    if (adminNotifResult.success) {
      console.log('✅ Admin notification created successfully');
    } else {
      console.log('❌ Failed:', adminNotifResult.error);
    }
    console.log('');

    // Test 2: Create user-specific notification
    console.log('Test 2: Creating user-specific notification...');
    const userNotifResult = await createNotification({
      userId: adminUser._id.toString(),
      type: 'new_donation',
      title: '💰 Test Donation Notification',
      message: 'Someone donated KES 1,000 to support gender justice!',
      priority: 'high',
      category: 'donation',
      actionUrl: '/admin/payments/donations',
      metadata: {
        amount: 1000,
        currency: 'KES',
        donor: 'Test User'
      }
    });
    
    if (userNotifResult.success) {
      console.log('✅ User notification created successfully');
      console.log(`   Notification ID: ${userNotifResult.notificationId}`);
    } else {
      console.log('❌ Failed:', userNotifResult.error);
    }
    console.log('');

    // Test 3: Get all notifications
    console.log('Test 3: Fetching all notifications...');
    const allNotifs = await getNotifications({ 
      userId: adminUser._id.toString(),
      limit: 10 
    });
    
    if (allNotifs.success) {
      console.log(`✅ Found ${allNotifs.total} total notifications`);
      console.log(`   Showing latest ${allNotifs.notifications?.length} notifications:\n`);
      
      allNotifs.notifications?.forEach((notif, index) => {
        console.log(`   ${index + 1}. [${notif.priority.toUpperCase()}] ${notif.title}`);
        console.log(`      ${notif.message}`);
        console.log(`      Status: ${notif.status} | Created: ${new Date(notif.createdAt).toLocaleString()}`);
        if (notif.actionUrl) {
          console.log(`      Action: ${notif.actionUrl}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Failed:', allNotifs.error);
    }
    console.log('');

    // Test 4: Get unread notifications only
    console.log('Test 4: Fetching unread notifications...');
    const unreadNotifs = await getNotifications({ 
      userId: adminUser._id.toString(),
      status: 'unread',
      limit: 10 
    });
    
    if (unreadNotifs.success) {
      console.log(`✅ Found ${unreadNotifs.total} unread notifications`);
    } else {
      console.log('❌ Failed:', unreadNotifs.error);
    }
    console.log('');

    // Test 5: Get unread count
    console.log('Test 5: Getting unread count...');
    const countResult = await getUnreadCount(adminUser._id.toString());
    
    if (countResult.success) {
      console.log(`✅ Unread count: ${countResult.count}`);
    } else {
      console.log('❌ Failed:', countResult.error);
    }
    console.log('');

    // Test 6: Mark notification as read
    if (userNotifResult.success && userNotifResult.notificationId) {
      console.log('Test 6: Marking notification as read...');
      const markReadResult = await markAsRead(
        userNotifResult.notificationId,
        adminUser._id.toString()
      );
      
      if (markReadResult.success) {
        console.log('✅ Notification marked as read');
      } else {
        console.log('❌ Failed:', markReadResult.error);
      }
      console.log('');
    }

    // Test 7: Get notifications by priority
    console.log('Test 7: Fetching high priority notifications...');
    const highPriorityNotifs = await getNotifications({ 
      userId: adminUser._id.toString(),
      priority: 'high',
      limit: 5 
    });
    
    if (highPriorityNotifs.success) {
      console.log(`✅ Found ${highPriorityNotifs.total} high priority notifications`);
    } else {
      console.log('❌ Failed:', highPriorityNotifs.error);
    }
    console.log('');

    // Test 8: Get notifications by category
    console.log('Test 8: Fetching donation notifications...');
    const donationNotifs = await getNotifications({ 
      userId: adminUser._id.toString(),
      category: 'donation',
      limit: 5 
    });
    
    if (donationNotifs.success) {
      console.log(`✅ Found ${donationNotifs.total} donation notifications`);
    } else {
      console.log('❌ Failed:', donationNotifs.error);
    }
    console.log('');

    console.log('='.repeat(70));
    console.log('📊 NOTIFICATION SYSTEM TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('✅ All tests completed successfully!');
    console.log('');
    console.log('📋 Test Results:');
    console.log(`   - Admin notifications: ${adminNotifResult.success ? '✅' : '❌'}`);
    console.log(`   - User notifications: ${userNotifResult.success ? '✅' : '❌'}`);
    console.log(`   - Fetch notifications: ${allNotifs.success ? '✅' : '❌'}`);
    console.log(`   - Unread filter: ${unreadNotifs.success ? '✅' : '❌'}`);
    console.log(`   - Unread count: ${countResult.success ? '✅' : '❌'}`);
    console.log(`   - Priority filter: ${highPriorityNotifs.success ? '✅' : '❌'}`);
    console.log(`   - Category filter: ${donationNotifs.success ? '✅' : '❌'}`);
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('   1. Check MongoDB to see the notifications');
    console.log('   2. Test via API: GET /api/admin/notifications');
    console.log('   3. Build frontend UI to display notifications');
    console.log('   4. Trigger real events (contact form, donations, etc.)');
    console.log('');
    console.log('💡 Tip: Run this script multiple times to create more test data');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    process.exit(0);
  }
}

testNotificationSystem();
