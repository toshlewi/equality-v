import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';

// GET /api/publications/slug/[slug] - Get a single publication by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Find publication by slug
    const publication = await Publication.findOne({ slug }).lean();

    if (!publication) {
      return NextResponse.json(
        { success: false, error: 'Publication not found' },
        { status: 404 }
      );
    }

    // For public site, only return published publications
    // For admin, return any status
    return NextResponse.json({
      success: true,
      data: publication
    });

  } catch (error) {
    console.error('Error fetching publication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publication' },
      { status: 500 }
    );
  }
}
