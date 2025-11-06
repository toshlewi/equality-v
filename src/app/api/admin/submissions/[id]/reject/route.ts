import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { sendEmail } from '@/lib/email';

export async function POST(
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

    // Check if user has permission to review content
    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { reviewNotes, reason } = body;

    if (!reviewNotes) {
      return NextResponse.json(
        { success: false, error: 'Review notes are required for rejection' },
        { status: 400 }
      );
    }

    await connectDB();

    const submission = await Article.findById(id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Submission is already rejected' },
        { status: 400 }
      );
    }

    // Update submission status
    submission.status = 'rejected';
    submission.reviewerId = session.user.id;
    submission.reviewNotes = reviewNotes;
    submission.reviewedAt = new Date();

    await submission.save();

    // Send rejection email to submitter
    try {
      await sendEmail({
        to: submission.submitterEmail,
        subject: 'Submission Update - Equality Vanguard',
        template: 'submission-rejected',
        data: {
          submitterName: submission.submitterName,
          submissionType: 'Article',
          title: submission.title,
          reviewDate: new Date().toLocaleDateString(),
          feedback: reviewNotes,
          reason: reason || 'Content does not meet our guidelines'
        }
      });
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Submission rejected successfully',
      data: {
        id: submission._id.toString(),
        status: submission.status,
        reviewedAt: submission.reviewedAt
      }
    });

  } catch (error) {
    console.error('Error rejecting submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reject submission' },
      { status: 500 }
    );
  }
}
