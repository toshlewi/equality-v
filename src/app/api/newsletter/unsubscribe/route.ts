import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { removeSubscriber, getSubscriberHash } from '@/lib/mailchimp';
import { sendEmail } from '@/lib/email';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  reason: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    // Validate Mailchimp configuration
    if (!process.env.MAILCHIMP_LIST_ID) {
      return NextResponse.json(
        { success: false, error: 'Newsletter service is not configured' },
        { status: 503 }
      );
    }

    const email = validatedData.email.toLowerCase();
    const subscriberHash = getSubscriberHash(email);

    // Remove subscriber from Mailchimp
    const result = await removeSubscriber(process.env.MAILCHIMP_LIST_ID, subscriberHash);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to unsubscribe from newsletter' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: 'You have been unsubscribed',
        template: 'newsletter-unsubscribe',
        data: {
          email,
          reason: validatedData.reason || 'No reason provided'
        }
      });
    } catch (emailError) {
      console.error('Error sending unsubscribe confirmation email:', emailError);
      // Don't fail the unsubscribe if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    // const token = searchParams.get('token'); // Unused for now

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

    // In a real implementation, you would verify the token
    // For now, we'll just process the unsubscribe
    const subscriberHash = getSubscriberHash(email);
    
    const result = await removeSubscriber(process.env.MAILCHIMP_LIST_ID, subscriberHash);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process unsubscribe' },
      { status: 500 }
    );
  }
}
