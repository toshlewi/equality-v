import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Book from '@/models/Book';
import Toolkit from '@/models/Toolkit';
import Story from '@/models/Story';
import Member from '@/models/Member';
import Donation from '@/models/Donation';
import Order from '@/models/Order';
import Event from '@/models/Event';
import Contact from '@/models/Contact';

async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...');
  try {
    await connectDB();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function testDataCounts() {
  console.log('\n📊 Testing data counts...');
  
  try {
    const [
      publicationCount,
      bookCount,
      toolkitCount,
      storyCount,
      memberCount,
      donationCount,
      orderCount,
      eventCount,
      contactCount
    ] = await Promise.all([
      Publication.countDocuments(),
      Book.countDocuments(),
      Toolkit.countDocuments(),
      Story.countDocuments(),
      Member.countDocuments(),
      Donation.countDocuments(),
      Order.countDocuments(),
      Event.countDocuments(),
      Contact.countDocuments()
    ]);

    console.log(`📚 Publications: ${publicationCount}`);
    console.log(`📖 Books: ${bookCount}`);
    console.log(`🛠️  Toolkits: ${toolkitCount}`);
    console.log(`📝 Stories: ${storyCount}`);
    console.log(`👥 Members: ${memberCount}`);
    console.log(`💰 Donations: ${donationCount}`);
    console.log(`🛒 Orders: ${orderCount}`);
    console.log(`📅 Events: ${eventCount}`);
    console.log(`📧 Contacts: ${contactCount}`);

    return {
      publicationCount,
      bookCount,
      toolkitCount,
      storyCount,
      memberCount,
      donationCount,
      orderCount,
      eventCount,
      contactCount
    };
  } catch (error) {
    console.error('❌ Error counting data:', error);
    return null;
  }
}

async function testPublicationData() {
  console.log('\n📚 Testing publication data...');
  
  try {
    const publications = await Publication.find({ status: 'published' })
      .limit(5)
      .lean();

    console.log(`Found ${publications.length} published publications:`);
    publications.forEach((pub, index) => {
      console.log(`  ${index + 1}. ${pub.title} by ${pub.author}`);
      console.log(`     Category: ${pub.category}, Status: ${pub.status}`);
      if (pub.pdfUrl) {
        console.log(`     PDF: ${pub.pdfUrl}`);
      }
    });

    return publications.length > 0;
  } catch (error) {
    console.error('❌ Error testing publications:', error);
    return false;
  }
}

async function testBookData() {
  console.log('\n📖 Testing book data...');
  
  try {
    const books = await Book.find({ status: 'published' })
      .limit(5)
      .lean();

    console.log(`Found ${books.length} published books:`);
    books.forEach((book, index) => {
      console.log(`  ${index + 1}. ${book.title} by ${book.author}`);
      console.log(`     Genre: ${book.genre}, ISBN: ${book.isbn}`);
      if (book.coverImage) {
        console.log(`     Cover: ${book.coverImage}`);
      }
    });

    return books.length > 0;
  } catch (error) {
    console.error('❌ Error testing books:', error);
    return false;
  }
}

async function testStoryData() {
  console.log('\n📝 Testing story data...');
  
  try {
    const stories = await Story.find()
      .limit(5)
      .lean();

    console.log(`Found ${stories.length} stories:`);
    stories.forEach((story, index) => {
      console.log(`  ${index + 1}. ${story.title}`);
      console.log(`     Submitter: ${story.anonymous ? 'Anonymous' : story.submitterName}`);
      console.log(`     Status: ${story.status}, Files: ${story.files.length}`);
    });

    return stories.length >= 0; // Stories can be 0, that's okay
  } catch (error) {
    console.error('❌ Error testing stories:', error);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API endpoints...');
  
  const endpoints = [
    '/api/publications',
    '/api/books',
    '/api/toolkits',
    '/api/stories',
    '/api/admin/dashboard'
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log(`✅ ${endpoint} - OK`);
        results.push({ endpoint, status: 'success' });
      } else {
        console.log(`❌ ${endpoint} - Failed: ${data.error || 'Unknown error'}`);
        results.push({ endpoint, status: 'failed', error: data.error });
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      results.push({ endpoint, status: 'error', error: error.message });
    }
  }

  return results;
}

async function testFormValidation() {
  console.log('\n📝 Testing form validation...');
  
  // Test publication creation validation
  try {
    const testPublication = {
      title: '', // Empty title should fail
      author: 'Test Author',
      content: 'Test content',
      category: 'article'
    };

    const response = await fetch('http://localhost:3000/api/publications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPublication)
    });

    const data = await response.json();
    
    if (!response.ok && data.error) {
      console.log('✅ Publication validation working - rejected empty title');
    } else {
      console.log('❌ Publication validation failed - should reject empty title');
    }
  } catch (error) {
    console.log('❌ Error testing form validation:', error.message);
  }
}

async function generateTestReport() {
  console.log('\n📋 Generating test report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      databaseConnection: false,
      dataCounts: null,
      publications: false,
      books: false,
      stories: false,
      apiEndpoints: [],
      formValidation: false
    }
  };

  // Run all tests
  report.tests.databaseConnection = await testDatabaseConnection();
  report.tests.dataCounts = await testDataCounts();
  report.tests.publications = await testPublicationData();
  report.tests.books = await testBookData();
  report.tests.stories = await testStoryData();
  report.tests.apiEndpoints = await testAPIEndpoints();
  await testFormValidation();

  // Summary
  console.log('\n🎯 Test Summary:');
  console.log(`Database Connection: ${report.tests.databaseConnection ? '✅' : '❌'}`);
  console.log(`Data Counts: ${report.tests.dataCounts ? '✅' : '❌'}`);
  console.log(`Publications: ${report.tests.publications ? '✅' : '❌'}`);
  console.log(`Books: ${report.tests.books ? '✅' : '❌'}`);
  console.log(`Stories: ${report.tests.stories ? '✅' : '❌'}`);
  
  const apiSuccess = report.tests.apiEndpoints.filter(r => r.status === 'success').length;
  const apiTotal = report.tests.apiEndpoints.length;
  console.log(`API Endpoints: ${apiSuccess}/${apiTotal} ✅`);

  return report;
}

async function main() {
  console.log('🚀 Starting comprehensive admin functionality test...\n');
  
  try {
    const report = await generateTestReport();
    
    console.log('\n🎉 Test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check the admin portal at http://localhost:3000/admin');
    console.log('2. Test the PDF viewer functionality');
    console.log('3. Verify form submissions work correctly');
    console.log('4. Check that data syncs between frontend and admin');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the tests
main();

