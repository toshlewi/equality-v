import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRecaptcha } from '@/lib/recaptcha';

const recaptchaSchema = z.object({
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recaptchaToken } = recaptchaSchema.parse(body);

    const isValid = await verifyRecaptcha(recaptchaToken);

    return NextResponse.json({ 
      success: isValid,
      message: isValid ? 'reCAPTCHA verification successful' : 'reCAPTCHA verification failed'
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, 
      error: 'reCAPTCHA verification failed' 
    }, { status: 500 });
  }
}