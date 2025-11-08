import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const partnershipInquirySchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(200),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters').max(100),
  contactEmail: z.string().email('Invalid email address'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  website: z.string().url().optional(),
  partnershipType: z.enum(['financial', 'collaborative', 'sponsorship', 'volunteer', 'other']),
  description: z.string().min(50, 'Description must be at least 50 characters').max(2000),
  goals: z.string().min(20, 'Goals must be at least 20 characters').max(1000),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  logoUrl: z.string().url().optional(),
  additionalInfo: z.string().max(1000).optional(),
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
    const validatedData = partnershipInquirySchema.parse(body);

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    // Sanitize input
    const sanitizedData = {
      organizationName: sanitizeInput(validatedData.organizationName),
      contactName: sanitizeInput(validatedData.contactName),
      contactEmail: validatedData.contactEmail.toLowerCase(),
      contactPhone: validatedData.contactPhone ? sanitizeInput(validatedData.contactPhone) : undefined,
      website: validatedData.website,
      partnershipType: validatedData.partnershipType,
      description: sanitizeInput(validatedData.description),
      goals: sanitizeInput(validatedData.goals),
      budget: validatedData.budget ? sanitizeInput(validatedData.budget) : undefined,
      timeline: validatedData.timeline ? sanitizeInput(validatedData.timeline) : undefined,
      logoUrl: validatedData.logoUrl,
      additionalInfo: validatedData.additionalInfo ? sanitizeInput(validatedData.additionalInfo) : undefined
    };

    // Create partnership inquiry record (using Contact model for now)
    const inquiry = new (await import('@/models/Contact')).default({
      name: sanitizedData.contactName,
      email: sanitizedData.contactEmail,
      phone: sanitizedData.contactPhone,
      subject: `Partnership Inquiry: ${sanitizedData.organizationName}`,
      message: `
Organization: ${sanitizedData.organizationName}
Partnership Type: ${sanitizedData.partnershipType}
Website: ${sanitizedData.website || 'Not provided'}

Description:
${sanitizedData.description}

Goals:
${sanitizedData.goals}

Budget: ${sanitizedData.budget || 'Not specified'}
Timeline: ${sanitizedData.timeline || 'Not specified'}

Additional Information:
${sanitizedData.additionalInfo || 'None'}

Logo URL: ${sanitizedData.logoUrl || 'Not provided'}
      `.trim(),
      category: 'partnership',
      status: 'new',
      priority: 'high',
      metadata: {
        organizationName: sanitizedData.organizationName,
        partnershipType: sanitizedData.partnershipType,
        website: sanitizedData.website,
        logoUrl: sanitizedData.logoUrl
      }
    });

    await inquiry.save();

    // Send confirmation email to organization
    try {
      await sendEmail({
        to: sanitizedData.contactEmail,
        subject: 'Partnership Inquiry Received - Equality Vanguard',
        template: 'partnership-confirmation',
        data: {
          organizationName: sanitizedData.organizationName,
          contactName: sanitizedData.contactName,
          partnershipType: sanitizedData.partnershipType,
          inquiryDate: new Date().toLocaleDateString()
        }
      });
    } catch (emailError) {
      console.error('Error sending partnership confirmation email:', emailError);
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@equalityvanguard.org',
        subject: `New Partnership Inquiry: ${sanitizedData.organizationName}`,
        template: 'admin-notification',
        data: {
          title: 'New Partnership Inquiry',
          message: `New partnership inquiry from ${sanitizedData.organizationName}`,
          type: 'partnership_inquiry',
          priority: 'high',
          timestamp: new Date().toLocaleString(),
          details: {
            organizationName: sanitizedData.organizationName,
            contactName: sanitizedData.contactName,
            contactEmail: sanitizedData.contactEmail,
            partnershipType: sanitizedData.partnershipType,
            website: sanitizedData.website
          }
        }
      });
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
    }

    // Create admin notification
    try {
      await createAdminNotification({
        type: 'partnership_inquiry',
        title: 'New Partnership Inquiry',
        message: `New partnership inquiry from ${sanitizedData.organizationName} (${sanitizedData.partnershipType})`,
        metadata: {
          inquiryId: inquiry._id.toString(),
          organizationName: sanitizedData.organizationName,
          partnershipType: sanitizedData.partnershipType
        },
        priority: 'high',
        category: 'partnership',
        actionUrl: `/admin/partnerships/${inquiry._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: {
        inquiryId: inquiry._id.toString(),
        status: 'new',
        message: 'Your partnership inquiry has been received. We will review it and get back to you soon.'
      }
    });

  } catch (error) {
    console.error('Partnership inquiry submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit partnership inquiry' },
      { status: 500 }
    );
  }
}
