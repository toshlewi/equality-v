import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name));
    
    // Test User model
    const User = (await import('../models/User')).default;
    const userCount = await User.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test Member model
    const Member = (await import('../models/Member')).default;
    const memberCount = await Member.countDocuments();
    console.log(`👤 Members in database: ${memberCount}`);
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection();
