import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplication from '@/models/VolunteerApplication';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/audit';

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected']).optional(),
  reviewNotes: z.string().optional(),
  interviewDate: z.string().datetime().optional(),
  interviewNotes: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const application = await VolunteerApplication.findById(id)
      .populate('jobId', 'title slug department type')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!application) {
      return ApiResponse.notFound('Application not found');
    }

    return ApiResponse.success({
      id: application._id.toString(),
      jobId: application.jobId ? (typeof application.jobId === 'object' ? application.jobId._id.toString() : application.jobId.toString()) : null,
      job: application.jobId && typeof application.jobId === 'object' ? {
        title: application.jobId.title,
        slug: application.jobId.slug,
        department: application.jobId.department,
        type: application.jobId.type
      } : null,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      coverLetter: application.coverLetter,
      resumeUrl: application.resumeUrl,
      portfolioUrl: application.portfolioUrl,
      linkedInUrl: application.linkedInUrl,
      additionalInfo: application.additionalInfo,
      applicationData: application.applicationData || {},
      status: application.status,
      reviewNotes: application.reviewNotes,
      reviewedBy: application.reviewedBy ? (typeof application.reviewedBy === 'object' ? application.reviewedBy.name : null) : null,
      reviewedAt: application.reviewedAt,
      interviewDate: application.interviewDate,
      interviewNotes: application.interviewNotes,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    return ApiResponse.error(
      'Failed to fetch application',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updateApplicationSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const application = await VolunteerApplication.findById(id)
      .populate('jobId', 'title');

    if (!application) {
      return ApiResponse.notFound('Application not found');
    }

    // Track if status changed
    const oldStatus = application.status;
    const statusChanged = body.status && body.status !== application.status;

    // Update application
    if (body.status !== undefined) application.status = body.status;
    if (body.reviewNotes !== undefined) application.reviewNotes = body.reviewNotes;
    if (body.interviewDate !== undefined) application.interviewDate = new Date(body.interviewDate);
    if (body.interviewNotes !== undefined) application.interviewNotes = body.interviewNotes;

    if (statusChanged || body.reviewNotes || body.interviewDate || body.interviewNotes) {
      application.reviewedBy = session.user.id;
      application.reviewedAt = new Date();
    }

    await application.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Volunteer application ${application._id.toString()} updated`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          applicationId: application._id.toString(),
          oldStatus,
          newStatus: application.status,
          jobTitle: application.jobId && typeof application.jobId === 'object' ? application.jobId.title : 'General Volunteer'
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    // Send email notification if status changed
    if (statusChanged && (body.status === 'shortlisted' || body.status === 'accepted' || body.status === 'rejected')) {
      try {
        const jobTitle = application.jobId && typeof application.jobId === 'object' 
          ? application.jobId.title 
          : 'the position';

        await sendEmail({
          to: application.applicantEmail,
          subject: `Application Update - ${jobTitle}`,
          template: 'application-status-update',
          data: {
            applicantName: application.applicantName,
            jobTitle,
            status: body.status,
            reviewNotes: body.reviewNotes || '',
            interviewDate: body.interviewDate ? new Date(body.interviewDate).toLocaleDateString() : ''
          }
        });
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return ApiResponse.success({
      id: application._id.toString(),
      status: application.status,
      reviewNotes: application.reviewNotes,
      interviewDate: application.interviewDate,
      interviewNotes: application.interviewNotes,
      reviewedAt: application.reviewedAt,
      updatedAt: application.updatedAt
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return ApiResponse.error(
      'Failed to update application',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

