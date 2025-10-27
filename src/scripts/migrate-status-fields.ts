import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Book from '@/models/Book';

async function migrateData() {
  try {
    console.log('🔄 Starting data migration...');
    await connectDB();
    
    // Update all existing publications to status: 'pending' and remove viewCount
    console.log('📚 Updating publications...');
    const pubResult = await Publication.updateMany(
      {},
      { 
        $set: { status: 'pending', type: 'pdf' },
        $unset: { viewCount: '' }
      }
    );
    console.log(`✅ Updated ${pubResult.modifiedCount} publications`);
    
    // Update all existing books to status: 'pending' and remove viewCount
    console.log('📖 Updating books...');
    const bookResult = await Book.updateMany(
      {},
      { 
        $set: { status: 'pending' },
        $unset: { viewCount: '' }
      }
    );
    console.log(`✅ Updated ${bookResult.modifiedCount} books`);
    
    console.log('\n🎉 Migration completed successfully!');
    
    // Show summary
    const [pubCount, bookCount] = await Promise.all([
      Publication.countDocuments(),
      Book.countDocuments()
    ]);

    console.log('\n📊 Current Counts:');
    console.log(`- Publications: ${pubCount}`);
    console.log(`- Books: ${bookCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateData();
