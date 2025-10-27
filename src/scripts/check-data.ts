import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Book from '@/models/Book';

async function checkAndFixData() {
  try {
    console.log('🔍 Checking current data...');
    await connectDB();
    
    const pubCount = await Publication.countDocuments();
    const bookCount = await Book.countDocuments();
    
    console.log(`\n📊 Current counts:`);
    console.log(`Publications: ${pubCount}`);
    console.log(`Books: ${bookCount}`);
    
    if (pubCount === 0) {
      console.log('\n❌ No publications found. Need to re-import.');
      console.log('Run: npx tsx src/scripts/replace-content.ts');
    } else {
      // Check status distribution
      const statusCounts = await Publication.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📊 Publication status distribution:');
      statusCounts.forEach(({ _id, count }) => {
        console.log(`  ${_id}: ${count}`);
      });
    }
    
    if (bookCount === 0) {
      console.log('\n❌ No books found. Need to re-import.');
    } else {
      const bookStatusCounts = await Book.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      console.log('\n📊 Book status distribution:');
      bookStatusCounts.forEach(({ _id, count }) => {
        console.log(`  ${_id}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkAndFixData();
