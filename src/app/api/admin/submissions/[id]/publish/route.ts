import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to publish content
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reviewNotes, featured } = body;

    await connectDB();

    const submission = await Article.findById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status === 'published') {
      return NextResponse.json(
        { success: false, error: 'Submission is already published' },
        { status: 400 }
      );
    }

    // Update submission status
    submission.status = 'published';
    submission.reviewerId = session.user.id;
    submission.reviewNotes = reviewNotes || '';
    submission.reviewedAt = new Date();
    submission.publishedAt = new Date();
    submission.featured = featured || false;

    await submission.save();

    // Send approval email to submitter
    try {
      await sendEmail({
        to: submission.submitterEmail,
        subject: 'Your Submission Has Been Approved!',
        template: 'submission-approved',
        data: {
          submitterName: submission.submitterName,
          submissionType: 'Article',
          title: submission.title,
          approvedDate: new Date().toLocaleDateString(),
          reviewNotes: reviewNotes || 'No additional notes provided.'
        }
      });
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Submission published successfully',
      data: {
        id: submission._id.toString(),
        status: submission.status,
        publishedAt: submission.publishedAt
      }
    });

  } catch (error) {
    console.error('Error publishing submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish submission' },
      { status: 500 }
    );
  }
}
