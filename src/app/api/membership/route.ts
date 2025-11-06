import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import { createPaymentIntent, createCheckoutSession } from '@/lib/stripe';
import { initiateSTKPush } from '@/lib/mpesa';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const membershipSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  membershipType: z.enum(['annual', 'lifetime', 'student', 'supporter']),
  membershipYears: z.string().optional().transform(val => val ? parseInt(val) : 1),
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
      $or: [
        { expiryDate: { $gt: new Date() } },
        { expiryDate: null } // For lifetime memberships
      ]
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

    // Calculate amount based on membership years
    // Membership is KSh 5,000 per year
    const membershipYears = validatedData.membershipYears || 1;
    let amount = membershipYears * 5000; // KSh 5,000 per year
    
    // TODO: Apply coupon discount if valid
    if (validatedData.couponCode) {
      // Implement coupon validation logic
      console.log('Coupon code:', validatedData.couponCode);
    }

    // Calculate subscription dates based on membership years
    const startDate = new Date();
    const endDate = new Date();
    
    if (validatedData.membershipType === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100); // 100 years = lifetime
    } else {
      // For annual, student, supporter - use membershipYears
      endDate.setFullYear(endDate.getFullYear() + membershipYears);
    }

    // Split name into firstName and lastName
    const nameParts = sanitizedData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create member record with pending status
    // IMPORTANT: Member is NOT active until payment is verified via webhook
    const member = new Member({
      firstName: firstName,
      lastName: lastName,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      membershipType: validatedData.membershipType,
      joinDate: startDate,
      expiryDate: endDate,
      isActive: false, // CRITICAL: Will ONLY be activated after payment is verified via webhook
      status: 'pending', // CRITICAL: Will ONLY be set to 'active' after payment is verified
      paymentStatus: 'pending', // Will be updated to 'paid' by webhook after payment
      paymentMethod: validatedData.paymentMethod,
      amount: amount,
      currency: 'KES'
    });

    await member.save();

    // Create payment based on method
    if (validatedData.paymentMethod === 'stripe') {
      // Create Stripe payment intent
      // Convert KES to USD for Stripe (approximate conversion, adjust as needed)
      // 1 USD ≈ 150 KES (update this rate as needed)
      const usdAmount = Math.round((amount / 150) * 100) / 100; // Convert to USD and round to 2 decimals
      const paymentIntent = await createPaymentIntent({
        amount: Math.round(usdAmount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          memberId: member._id.toString(),
          membershipType: validatedData.membershipType,
          membershipYears: membershipYears.toString(),
          originalAmount: amount.toString(),
          originalCurrency: 'KES',
          type: 'membership'
        },
        customerEmail: sanitizedData.email,
        customerName: sanitizedData.name,
        description: `Equality Vanguard ${validatedData.membershipType} membership (${membershipYears} year${membershipYears > 1 ? 's' : ''})`
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
        currency: 'KES'
        }
      });
    } else if (validatedData.paymentMethod === 'mpesa') {
      // Initiate M-Pesa STK Push
      try {
        // Format phone number (ensure it starts with country code)
        let phoneNumber = sanitizedData.phone.trim();
        if (!phoneNumber.startsWith('254')) {
          // Assume Kenyan number, add country code if missing
          if (phoneNumber.startsWith('0')) {
            phoneNumber = '254' + phoneNumber.substring(1);
          } else if (phoneNumber.startsWith('7')) {
            phoneNumber = '254' + phoneNumber;
          } else {
            phoneNumber = '254' + phoneNumber;
          }
        }

        // Generate callback URL
        const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/mpesa`;
        
        // Create account reference in format: membership_{memberId}
        const accountReference = `membership_${member._id.toString()}`;
        
        // Initiate STK Push
        const stkPushResponse = await initiateSTKPush({
          phone: phoneNumber,
          amount: amount,
          accountReference: accountReference,
          transactionDesc: `Equality Vanguard ${validatedData.membershipType} membership (${membershipYears} year${membershipYears > 1 ? 's' : ''})`,
          callbackUrl: callbackUrl
        });

        // Update member with checkout request ID for tracking
        member.paymentId = stkPushResponse.CheckoutRequestID;
        member.paymentProvider = 'mpesa';
        await member.save();

        return NextResponse.json({
          success: true,
          data: {
            memberId: member._id.toString(),
            checkoutRequestId: stkPushResponse.CheckoutRequestID,
            merchantRequestId: stkPushResponse.MerchantRequestID,
            customerMessage: stkPushResponse.CustomerMessage,
            amount: amount,
            currency: 'KES',
            phone: phoneNumber
          }
        });
      } catch (stkError) {
        console.error('M-Pesa STK Push error:', stkError);
        
        // Update member status to indicate payment initiation failed
        member.paymentStatus = 'failed';
        member.status = 'failed';
        await member.save();

        const errorMessage = stkError instanceof Error 
          ? stkError.message 
          : 'Failed to initiate M-Pesa payment';
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          data: {
            memberId: member._id.toString(),
            message: 'Membership created but payment initiation failed. Please try again or contact support.'
          }
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('Membership creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    // Provide more specific error messages
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create membership';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
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
