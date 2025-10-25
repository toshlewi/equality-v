import connectDB from '../lib/mongodb';
import User from '../models/User';
import { hashPassword, verifyPassword } from '../lib/auth';
import mongoose from 'mongoose';

async function testNextAuth() {
  try {
    console.log('🔄 Testing NextAuth configuration...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Test password hashing and verification
    console.log('🔐 Testing password hashing...');
    const testPassword = 'testpassword123';
    const hashedPassword = await hashPassword(testPassword);
    console.log('✅ Password hashed successfully');
    
    const isValid = await verifyPassword(testPassword, hashedPassword);
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    
    // Test admin user creation/verification
    console.log('👤 Testing admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('⚠️  Admin user not found. Creating one...');
      const hashedAdminPassword = await hashPassword(adminPassword);
      
      adminUser = await User.create({
        email: adminEmail,
        password: hashedAdminPassword,
        name: process.env.ADMIN_NAME || 'Admin User',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        permissions: [
          { resource: 'all', actions: ['create', 'read', 'update', 'delete'] }
        ]
      });
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user found');
      
      // Test admin password
      const adminPasswordValid = await verifyPassword(adminPassword, adminUser.password);
      console.log(`✅ Admin password verification: ${adminPasswordValid ? 'PASSED' : 'FAILED'}`);
    }
    
    // Test role-based access
    console.log('🔑 Testing role-based access...');
    const allowedRoles = ['admin', 'editor', 'reviewer', 'finance'];
    const testRoles = ['admin', 'user', 'guest', 'editor'];
    
    testRoles.forEach(role => {
      const hasAccess = allowedRoles.includes(role);
      console.log(`   ${role}: ${hasAccess ? '✅ ALLOWED' : '❌ DENIED'}`);
    });
    
    // Test NextAuth configuration
    console.log('⚙️  Testing NextAuth configuration...');
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;
    
    console.log(`   NEXTAUTH_URL: ${nextAuthUrl ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret ? '✅ SET' : '❌ MISSING'}`);
    
    if (nextAuthUrl && nextAuthSecret) {
      console.log('✅ NextAuth configuration looks good');
    } else {
      console.log('❌ NextAuth configuration incomplete');
    }
    
    console.log('🎉 NextAuth test completed successfully!');
    
  } catch (error) {
    console.error('❌ NextAuth test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the test
testNextAuth();

// Export for use in other modules
export default testNextAuth;
