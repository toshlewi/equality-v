import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await connectDB();

    const submission = await Article.findById(id)
      .populate('reviewerId', 'name email role');

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: submission._id.toString(),
        title: submission.title,
        slug: submission.slug,
        authorName: submission.authorName,
        authorEmail: submission.authorEmail,
        authorPhone: submission.authorPhone,
        language: submission.language,
        tags: submission.tags,
        excerpt: submission.excerpt,
        body: submission.body,
        coverImageUrl: submission.coverImageUrl,
        attachments: submission.attachments,
        status: submission.status,
        submitterName: submission.submitterName,
        submitterEmail: submission.submitterEmail,
        submitterPhone: submission.submitterPhone,
        reviewer: submission.reviewerId ? {
          id: submission.reviewerId._id.toString(),
          name: submission.reviewerId.name,
          email: submission.reviewerId.email,
          role: submission.reviewerId.role
        } : null,
        reviewNotes: submission.reviewNotes,
        reviewedAt: submission.reviewedAt,
        publishedAt: submission.publishedAt,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        viewCount: submission.viewCount,
        likeCount: submission.likeCount,
        shareCount: submission.shareCount
      }
    });

  } catch (error) {
    console.error('Error fetching submission details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission details' },
      { status: 500 }
    );
  }
}
