import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplication from '@/models/VolunteerApplication';
import Job from '@/models/Job';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const applicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  applicantName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  applicantEmail: z.string().email('Invalid email address'),
  applicantPhone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(5000),
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  linkedInUrl: z.string().url().optional(),
  additionalInfo: z.string().max(1000).optional(),
  applicationData: z.record(z.string(), z.any()).optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = formRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify job exists and is open
    const job = await Job.findById(validatedData.jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'open' || !job.isPublic) {
      return NextResponse.json(
        { success: false, error: 'This job is not currently accepting applications' },
        { status: 400 }
      );
    }

    // Check if application deadline has passed
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Application deadline has passed' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = {
      jobId: validatedData.jobId,
      applicantName: sanitizeInput(validatedData.applicantName),
      applicantEmail: validatedData.applicantEmail.toLowerCase(),
      applicantPhone: validatedData.applicantPhone ? sanitizeInput(validatedData.applicantPhone) : undefined,
      coverLetter: sanitizeInput(validatedData.coverLetter),
      resumeUrl: validatedData.resumeUrl,
      portfolioUrl: validatedData.portfolioUrl,
      linkedInUrl: validatedData.linkedInUrl,
      additionalInfo: validatedData.additionalInfo ? sanitizeInput(validatedData.additionalInfo) : undefined,
      applicationData: validatedData.applicationData,
      termsAccepted: validatedData.termsAccepted,
      privacyAccepted: validatedData.privacyAccepted,
      recaptchaToken: validatedData.recaptchaToken,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Create application
    const application = new VolunteerApplication(sanitizedData);
    await application.save();

    // Update job application count
    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: sanitizedData.applicantEmail,
        subject: `Application Received - ${job.title}`,
        template: 'application-confirmation',
        data: {
          applicantName: sanitizedData.applicantName,
          jobTitle: job.title,
          applicationDate: new Date().toLocaleDateString()
        }
      });
    } catch (emailError) {
      console.error('Error sending application confirmation email:', emailError);
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@equalityvanguard.org',
        subject: `New Job Application: ${job.title}`,
        template: 'admin-notification',
        data: {
          title: 'New Job Application',
          message: `New application received for ${job.title}`,
          type: 'job_application',
          priority: 'medium',
          timestamp: new Date().toLocaleString(),
          details: {
            jobTitle: job.title,
            applicantName: sanitizedData.applicantName,
            applicantEmail: sanitizedData.applicantEmail
          }
        }
      });
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
    }

    // Create admin notification
    try {
      await createAdminNotification({
        type: 'job_application',
        title: 'New Job Application',
        message: `New application for ${job.title} from ${sanitizedData.applicantName}`,
        metadata: {
          applicationId: application._id.toString(),
          jobId: job._id.toString(),
          jobTitle: job.title,
          applicantName: sanitizedData.applicantName,
          applicantEmail: sanitizedData.applicantEmail
        },
        priority: 'medium',
        category: 'jobs',
        actionUrl: `/admin/members/volunteers/${application._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application._id.toString(),
        status: 'pending',
        message: 'Your application has been received. We will review it and get back to you soon.'
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

