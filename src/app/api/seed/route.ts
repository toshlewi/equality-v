import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-data';

export async function POST(req: NextRequest) {
  try {
    const result = await seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        booksCount: result.books.length,
        publicationsCount: result.publications.length
      }
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
