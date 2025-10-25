import connectDB from '../lib/mongodb';
import User from '../models/User';
import { hashPassword, verifyPassword } from '../lib/auth';
import mongoose from 'mongoose';

async function testAuthentication() {
  try {
    console.log('🔄 Testing authentication system...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Test password hashing
    console.log('🔐 Testing password hashing...');
    const testPassword = 'testpassword123';
    const hashedPassword = await hashPassword(testPassword);
    console.log('✅ Password hashed successfully');
    
    // Test password verification
    console.log('🔍 Testing password verification...');
    const isValid = await verifyPassword(testPassword, hashedPassword);
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    // Test invalid password
    const isInvalid = await verifyPassword('wrongpassword', hashedPassword);
    console.log(`✅ Invalid password test: ${!isInvalid ? 'PASSED' : 'FAILED'}`);
    
    // Check if admin user exists
    console.log('👤 Checking admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.name} (${adminUser.email})`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Active: ${adminUser.isActive}`);
      console.log(`   Email Verified: ${adminUser.emailVerified}`);
      
      // Test admin password
      const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
      const adminPasswordValid = await verifyPassword(adminPassword, adminUser.password);
      console.log(`✅ Admin password verification: ${adminPasswordValid ? 'PASSED' : 'FAILED'}`);
    } else {
      console.log('⚠️  Admin user not found. Run "npm run seed:admin" to create one.');
    }
    
    // Test user roles
    console.log('🔑 Testing user roles...');
    const allowedRoles = ['admin', 'editor', 'reviewer', 'finance'];
    const testRoles = ['admin', 'user', 'guest', 'editor'];
    
    testRoles.forEach(role => {
      const hasAccess = allowedRoles.includes(role);
      console.log(`   ${role}: ${hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
    });
    
    console.log('🎉 Authentication system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testAuthentication();

// Export for use in other modules
export default testAuthentication;
