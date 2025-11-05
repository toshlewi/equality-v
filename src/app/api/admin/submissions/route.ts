import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to view submissions
    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    await connectDB();

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { submitterName: { $regex: search, $options: 'i' } },
        { submitterEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const submissions = await Article.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit)
      .populate('reviewerId', 'name email')
      .select('-body'); // Exclude body for list view

    const total = await Article.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        submissions: submissions.map(submission => ({
          id: submission._id.toString(),
          title: submission.title,
          authorName: submission.authorName,
          submitterName: submission.submitterName,
          submitterEmail: submission.submitterEmail,
          status: submission.status,
          language: submission.language,
          tags: submission.tags,
          excerpt: submission.excerpt,
          createdAt: submission.createdAt,
          reviewedAt: submission.reviewedAt,
          reviewer: submission.reviewerId ? {
            name: submission.reviewerId.name,
            email: submission.reviewerId.email
          } : null
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
