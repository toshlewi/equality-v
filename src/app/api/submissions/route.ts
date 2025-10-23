import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';

const submissionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(300),
  authorName: z.string().min(2, 'Author name must be at least 2 characters').max(100),
  authorEmail: z.string().email('Invalid email address'),
  authorPhone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  language: z.string().default('en'),
  tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags allowed'),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(100, 'Content must be at least 100 characters'),
  coverImageUrl: z.string().url().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string(),
    size: z.number()
  })).max(5, 'Maximum 5 attachments allowed').optional(),
  submitterName: z.string().min(2, 'Submitter name must be at least 2 characters').max(100),
  submitterEmail: z.string().email('Invalid email address'),
  submitterPhone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

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
      title: sanitizeInput(validatedData.title),
      authorName: sanitizeInput(validatedData.authorName),
      authorEmail: validatedData.authorEmail.toLowerCase(),
      authorPhone: validatedData.authorPhone ? sanitizeInput(validatedData.authorPhone) : undefined,
      language: validatedData.language,
      tags: validatedData.tags.map(tag => sanitizeInput(tag)),
      excerpt: validatedData.excerpt ? sanitizeInput(validatedData.excerpt) : undefined,
      body: sanitizeInput(validatedData.body),
      coverImageUrl: validatedData.coverImageUrl,
      attachments: validatedData.attachments || [],
      submitterName: sanitizeInput(validatedData.submitterName),
      submitterEmail: validatedData.submitterEmail.toLowerCase(),
      submitterPhone: validatedData.submitterPhone ? sanitizeInput(validatedData.submitterPhone) : undefined
    };

    // Create article record with pending status
    const article = new Article({
      title: sanitizedData.title,
      authorName: sanitizedData.authorName,
      authorEmail: sanitizedData.authorEmail,
      authorPhone: sanitizedData.authorPhone,
      language: sanitizedData.language,
      tags: sanitizedData.tags,
      excerpt: sanitizedData.excerpt,
      body: sanitizedData.body,
      coverImageUrl: sanitizedData.coverImageUrl,
      attachments: sanitizedData.attachments,
      submitterName: sanitizedData.submitterName,
      submitterEmail: sanitizedData.submitterEmail,
      submitterPhone: sanitizedData.submitterPhone,
      status: 'pending',
      termsAccepted: validatedData.termsAccepted,
      privacyAccepted: validatedData.privacyAccepted
    });

    await article.save();

    // Send confirmation email to submitter
    try {
      await sendEmail({
        to: sanitizedData.submitterEmail,
        subject: 'Submission Received - Equality Vanguard',
        template: 'submission-received',
        data: {
          submitterName: sanitizedData.submitterName,
          submissionType: 'Article',
          title: sanitizedData.title,
          submissionDate: new Date().toLocaleDateString()
        }
      });
    } catch (emailError) {
      console.error('Error sending submission confirmation email:', emailError);
    }

    // Create admin notification
    try {
      await createAdminNotification({
        type: 'content_submission',
        title: 'New Content Submission',
        message: `New article submission: "${sanitizedData.title}" by ${sanitizedData.submitterName}`,
        metadata: {
          submissionId: article._id.toString(),
          submitterEmail: sanitizedData.submitterEmail,
          submissionType: 'article'
        },
        priority: 'medium',
        category: 'content',
        actionUrl: `/admin/content/submissions/${article._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: {
        submissionId: article._id.toString(),
        status: 'pending',
        message: 'Your submission has been received and is under review.'
      }
    });

  } catch (error) {
    console.error('Submission creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (submissionId) {
      // Get specific submission
      const article = await Article.findById(submissionId);
      
      if (!article) {
        return NextResponse.json(
          { success: false, error: 'Submission not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: article._id.toString(),
          title: article.title,
          authorName: article.authorName,
          status: article.status,
          createdAt: article.createdAt,
          reviewedAt: article.reviewedAt
        }
      });
    } else if (email) {
      // Get submissions by email
      const articles = await Article.find({ 
        submitterEmail: email.toLowerCase() 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Article.countDocuments({ 
        submitterEmail: email.toLowerCase() 
      });

      return NextResponse.json({
        success: true,
        data: {
          submissions: articles.map(article => ({
            id: article._id.toString(),
            title: article.title,
            authorName: article.authorName,
            status: article.status,
            createdAt: article.createdAt,
            reviewedAt: article.reviewedAt
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } else {
      // Get public submissions (published only)
      const articles = await Article.find({ 
        status: 'published'
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Article.countDocuments({ 
        status: 'published'
      });

      return NextResponse.json({
        success: true,
        data: {
          submissions: articles.map(article => ({
            id: article._id.toString(),
            title: article.title,
            authorName: article.authorName,
            excerpt: article.excerpt,
            tags: article.tags,
            publishedAt: article.publishedAt,
            viewCount: article.viewCount
          })),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    }

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
