import { connectDB } from '../lib/mongodb';
import mongoose from 'mongoose';

async function testDatabaseIndexes() {
  try {
    console.log('🔄 Testing database indexes...');
    
    // Connect to database
    await connectDB();
    
    // Test Article model indexes
    const Article = (await import('../models/Article')).default;
    const articleIndexes = await Article.collection.getIndexes();
    console.log('📚 Article indexes:', Object.keys(articleIndexes));
    
    // Test Member model indexes
    const Member = (await import('../models/Member')).default;
    const memberIndexes = await Member.collection.getIndexes();
    console.log('👤 Member indexes:', Object.keys(memberIndexes));
    
    // Test Event model indexes
    const Event = (await import('../models/Event')).default;
    const eventIndexes = await Event.collection.getIndexes();
    console.log('📅 Event indexes:', Object.keys(eventIndexes));
    
    // Test Donation model indexes
    const Donation = (await import('../models/Donation')).default;
    const donationIndexes = await Donation.collection.getIndexes();
    console.log('💰 Donation indexes:', Object.keys(donationIndexes));
    
    console.log('🎉 Database indexes test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database indexes test failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseIndexes();
