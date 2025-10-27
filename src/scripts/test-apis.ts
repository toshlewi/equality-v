import { connectDB } from '@/lib/mongodb';
import { migrateContent } from './migrate-content';

async function testAPIs() {
  try {
    console.log('🧪 Starting API testing...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Run content migration first
    console.log('\n📚 Running content migration...');
    await migrateContent();

    // Test Publications API
    console.log('\n📝 Testing Publications API...');
    const publicationsResponse = await fetch('http://localhost:3000/api/publications?limit=5');
    const publicationsData = await publicationsResponse.json();
    
    if (publicationsData.success) {
      console.log(`✅ Publications API working - Found ${publicationsData.data.publications.length} publications`);
    } else {
      console.log('❌ Publications API failed:', publicationsData.error);
    }

    // Test Books API
    console.log('\n📖 Testing Books API...');
    const booksResponse = await fetch('http://localhost:3000/api/books?limit=5');
    const booksData = await booksResponse.json();
    
    if (booksData.success) {
      console.log(`✅ Books API working - Found ${booksData.data.books.length} books`);
    } else {
      console.log('❌ Books API failed:', booksData.error);
    }

    // Test Book Meetings API
    console.log('\n📅 Testing Book Meetings API...');
    const meetingsResponse = await fetch('http://localhost:3000/api/book-meetings?limit=5');
    const meetingsData = await meetingsResponse.json();
    
    if (meetingsData.success) {
      console.log(`✅ Book Meetings API working - Found ${meetingsData.data.bookMeetings.length} meetings`);
    } else {
      console.log('❌ Book Meetings API failed:', meetingsData.error);
    }

    // Test Partnerships API
    console.log('\n🤝 Testing Partnerships API...');
    const partnershipsResponse = await fetch('http://localhost:3000/api/partnerships?limit=5');
    const partnershipsData = await partnershipsResponse.json();
    
    if (partnershipsData.success) {
      console.log(`✅ Partnerships API working - Found ${partnershipsData.data.partnerships.length} partnerships`);
    } else {
      console.log('❌ Partnerships API failed:', partnershipsData.error);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit http://localhost:3000/admin/content/publications');
    console.log('3. Visit http://localhost:3000/admin/content/books');
    console.log('4. Test creating, editing, and deleting content');
    
  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testAPIs();
}

export { testAPIs };
