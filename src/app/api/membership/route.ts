import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import { createPaymentIntent, createCheckoutSession } from '@/lib/stripe';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const membershipSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  membershipType: z.enum(['annual', 'lifetime', 'student', 'supporter']),
  paymentMethod: z.enum(['stripe', 'mpesa']),
  couponCode: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
});

const MEMBERSHIP_PRICES = {
  annual: 50, // $50 USD
  lifetime: 200, // $200 USD
  student: 25, // $25 USD
  supporter: 100 // $100 USD
} as const;

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = formRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = membershipSchema.parse(body);

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email already has active membership
    const existingMember = await Member.findOne({
      email: validatedData.email.toLowerCase(),
      isActive: true,
      subscriptionEnd: { $gt: new Date() }
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: 'Email already has an active membership' },
        { status: 400 }
      );
    }

    // Sanitize input
    const sanitizedData = {
      name: sanitizeInput(validatedData.name),
      email: validatedData.email.toLowerCase(),
      phone: sanitizeInput(validatedData.phone),
      membershipType: validatedData.membershipType,
      paymentMethod: validatedData.paymentMethod
    };

    // Calculate amount
    let amount = MEMBERSHIP_PRICES[validatedData.membershipType];
    
    // TODO: Apply coupon discount if valid
    if (validatedData.couponCode) {
      // Implement coupon validation logic
      console.log('Coupon code:', validatedData.couponCode);
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (validatedData.membershipType === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (validatedData.membershipType === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100); // 100 years = lifetime
    } else if (validatedData.membershipType === 'student') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (validatedData.membershipType === 'supporter') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Split name into firstName and lastName
    const nameParts = sanitizedData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create member record with pending status
    const member = new Member({
      firstName: firstName,
      lastName: lastName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      membershipType: validatedData.membershipType,
      joinDate: startDate,
      expiryDate: endDate,
      isActive: false, // Will be activated after payment
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: validatedData.paymentMethod,
      amount: amount,
      currency: 'USD'
    });

    await member.save();

    // Create payment based on method
    if (validatedData.paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await createPaymentIntent({
        amount: amount,
        currency: 'usd',
        metadata: {
          memberId: member._id.toString(),
          membershipType: validatedData.membershipType,
          type: 'membership'
        },
        customerEmail: sanitizedData.email,
        customerName: sanitizedData.name,
        description: `Equality Vanguard ${validatedData.membershipType} membership`
      });

      // Update member with payment ID
      member.paymentId = paymentIntent.id;
      await member.save();

      return NextResponse.json({
        success: true,
        data: {
          memberId: member._id.toString(),
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: amount,
          currency: 'USD'
        }
      });
    } else if (validatedData.paymentMethod === 'mpesa') {
      // TODO: Implement M-Pesa STK Push
      // For now, return success with pending status
      return NextResponse.json({
        success: true,
        data: {
          memberId: member._id.toString(),
          status: 'pending_mpesa',
          amount: amount,
          currency: 'USD',
          message: 'M-Pesa integration coming soon'
        }
      });
    }

  } catch (error) {
    console.error('Membership creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create membership' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const email = searchParams.get('email');

    if (!memberId && !email) {
      return NextResponse.json(
        { success: false, error: 'Member ID or email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const query: any = {};
    if (memberId) query._id = memberId;
    if (email) query.email = email.toLowerCase();

    const member = await Member.findOne(query);

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        membershipType: member.membershipType,
        subscriptionStart: member.subscriptionStart,
        subscriptionEnd: member.subscriptionEnd,
        isActive: member.isActive,
        paymentStatus: member.paymentStatus,
        createdAt: member.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching membership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch membership' },
      { status: 500 }
    );
  }
}
