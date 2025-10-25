import { connectDB } from '@/lib/mongodb';
import { migratePublications } from './migrate-publications';
import { migrateBooks } from './migrate-books';
import { migrateTeam } from './migrate-team';
import { seedInitialData } from './seed-initial-data';

async function main() {
  try {
    console.log('🚀 Starting content migration...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Run migrations in sequence
    console.log('\n📚 Migrating publications...');
    await migratePublications();
    
    console.log('\n📖 Migrating books...');
    await migrateBooks();
    
    console.log('\n👥 Migrating team data...');
    await migrateTeam();
    
    console.log('\n🌱 Seeding initial data...');
    await seedInitialData();
    
    console.log('\n🎉 Content migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  main();
}

export { main as migrateContent };
