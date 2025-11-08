import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addSubscriber } from '@/lib/mailchimp';
// import { syncMemberToMailchimp } from '@/lib/mailchimp'; // Unused for now
import { sendEmail } from '@/lib/email';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
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
    const validatedData = newsletterSubscribeSchema.parse(body);

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = {
      email: validatedData.email.toLowerCase(),
      name: validatedData.name ? sanitizeInput(validatedData.name) : undefined,
      tags: validatedData.tags || [],
      source: validatedData.source ? sanitizeInput(validatedData.source) : 'website'
    };

    // Validate Mailchimp configuration
    if (!process.env.MAILCHIMP_LIST_ID) {
      return NextResponse.json(
        { success: false, error: 'Newsletter service is not configured' },
        { status: 503 }
      );
    }

    // Add default tags
    const tags = [
      'newsletter',
      `source_${sanitizedData.source}`,
      ...sanitizedData.tags
    ];

    // Add subscriber to Mailchimp
    const result = await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
      email: sanitizedData.email,
      name: sanitizedData.name,
      tags,
      status: 'subscribed'
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      await sendEmail({
        to: sanitizedData.email,
        subject: 'Welcome to Equality Vanguard Newsletter!',
        template: 'newsletter-welcome',
        data: {
          name: sanitizedData.name || 'there',
          email: sanitizedData.email
        }
      });
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate Mailchimp configuration
    if (!process.env.MAILCHIMP_LIST_ID) {
      return NextResponse.json(
        { success: false, error: 'Newsletter service is not configured' },
        { status: 503 }
      );
    }

    // Check if email is subscribed
    const { getSubscriber, getSubscriberHash } = await import('@/lib/mailchimp');
    const subscriberHash = getSubscriberHash(email);
    
    const result = await getSubscriber(process.env.MAILCHIMP_LIST_ID, subscriberHash);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscribed: !!result.subscriber,
      subscriber: result.subscriber
    });

  } catch (error) {
    console.error('Error checking newsletter subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
