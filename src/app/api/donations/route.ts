import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donation';
import { createPaymentIntent, isStripeConfigured } from '@/lib/stripe';
// import { initiateSTKPush, mpesaClient } from '@/lib/mpesa'; // Unused for now
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';
import { createAdminNotification } from '@/lib/notifications';
import { formRateLimit } from '@/middleware/rate-limit';

const donationSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  donorEmail: z.string().email('Invalid email address'),
  donorPhone: z.string().min(10, 'Phone number must be at least 10 characters'),
  amount: z.number().min(1, 'Amount must be at least $1').max(10000, 'Amount cannot exceed $10,000'),
  currency: z.string().default('USD').optional(),
  donationType: z.enum(['cash', 'product', 'service']),
  category: z.enum(['general', 'education', 'healthcare', 'emergency', 'events', 'other']),
  paymentMethod: z.enum(['stripe', 'mpesa']),
  anonymous: z.boolean().default(false),
  campaignTag: z.string().optional(),
  message: z.string().max(500).optional(),
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
    const validatedData = donationSchema.parse(body);

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
      donorName: sanitizeInput(validatedData.donorName),
      donorEmail: validatedData.donorEmail.toLowerCase(),
      donorPhone: sanitizeInput(validatedData.donorPhone),
      amount: validatedData.amount,
      donationType: validatedData.donationType,
      category: validatedData.category,
      paymentMethod: validatedData.paymentMethod,
      anonymous: validatedData.anonymous,
      campaignTag: validatedData.campaignTag ? sanitizeInput(validatedData.campaignTag) : undefined,
      message: validatedData.message ? sanitizeInput(validatedData.message) : undefined
    };

    // Create donation record with pending status
    const donation = new Donation({
      donorName: sanitizedData.donorName,
      donorEmail: sanitizedData.donorEmail,
      donorPhone: sanitizedData.donorPhone,
      amount: sanitizedData.amount,
      currency: 'USD',
      donationType: validatedData.donationType,
      category: validatedData.category,
      paymentMethod: validatedData.paymentMethod,
      anonymous: validatedData.anonymous,
      campaignTag: sanitizedData.campaignTag,
      message: sanitizedData.message,
      status: 'pending',
      paymentStatus: 'pending',
      termsAccepted: validatedData.termsAccepted,
      privacyAccepted: validatedData.privacyAccepted
    });

    await donation.save();

    // Create admin notification for new donation submission
    try {
      await createAdminNotification({
        type: 'donation_submitted',
        title: 'New Donation Submitted',
        message: `New donation of ${validatedData.currency || 'USD'}${validatedData.amount} from ${sanitizedData.donorName}${validatedData.anonymous ? ' (Anonymous)' : ''}`,
        metadata: {
          donationId: donation._id.toString(),
          donorName: validatedData.anonymous ? 'Anonymous' : sanitizedData.donorName,
          donorEmail: validatedData.anonymous ? 'N/A' : sanitizedData.donorEmail,
          amount: validatedData.amount,
          currency: validatedData.currency || 'USD',
          donationType: validatedData.donationType,
          paymentMethod: validatedData.paymentMethod
        },
        priority: 'medium',
        category: 'donations',
        actionUrl: `/admin/payments/donations/${donation._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
      // Don't fail the request if notification fails
    }

    // Create payment based on method
    if (validatedData.paymentMethod === 'stripe') {
      // Validate Stripe configuration
      if (!isStripeConfigured) {
        return NextResponse.json(
          { success: false, error: 'Stripe payment is not configured' },
          { status: 503 }
        );
      }

      // Create Stripe payment intent
      const paymentIntent = await createPaymentIntent({
        amount: validatedData.amount,
        currency: 'usd',
        metadata: {
          donationId: donation._id.toString(),
          donationType: validatedData.donationType,
          type: 'donation'
        },
        customerEmail: sanitizedData.donorEmail,
        customerName: sanitizedData.donorName,
        description: `Donation to Equality Vanguard - ${validatedData.category}`
      });

      // Update donation with payment ID
      donation.paymentId = paymentIntent.id;
      await donation.save();

      return NextResponse.json({
        success: true,
        data: {
          donationId: donation._id.toString(),
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: validatedData.amount,
          currency: 'USD'
        }
      });
    } else if (validatedData.paymentMethod === 'mpesa') {
      // For M-Pesa, don't initiate STK Push here
      // The user will initiate it from the payment step
      return NextResponse.json({
        success: true,
        data: {
          donationId: donation._id.toString(),
          amount: validatedData.amount,
          currency: 'KES',
          message: 'Donation created. Please proceed to payment.'
        }
      });
    }

  } catch (error) {
    console.error('Donation creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get('donationId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (donationId) {
      // Get specific donation
      const donation = await Donation.findById(donationId);
      
      if (!donation) {
        return NextResponse.json(
          { success: false, error: 'Donation not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: donation._id.toString(),
          donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
          amount: donation.amount,
          currency: donation.currency,
          donationType: donation.donationType,
          category: donation.category,
          status: donation.status,
          paymentStatus: donation.paymentStatus,
          createdAt: donation.createdAt
        }
      });
    } else if (email) {
      // Get donations by email
      const donations = await Donation.find({ 
        donorEmail: email.toLowerCase() 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Donation.countDocuments({ 
        donorEmail: email.toLowerCase() 
      });

      return NextResponse.json({
        success: true,
        data: {
          donations: donations.map(donation => ({
            id: donation._id.toString(),
            donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
            amount: donation.amount,
            currency: donation.currency,
            donationType: donation.donationType,
            category: donation.category,
            status: donation.status,
            paymentStatus: donation.paymentStatus,
            createdAt: donation.createdAt
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
      // Get public donations (recent, successful only)
      const donations = await Donation.find({ 
        status: 'completed',
        paymentStatus: 'paid'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Donation.countDocuments({ 
        status: 'completed',
        paymentStatus: 'paid'
      });

      return NextResponse.json({
        success: true,
        data: {
          donations: donations.map(donation => ({
            id: donation._id.toString(),
            donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
            amount: donation.amount,
            currency: donation.currency,
            category: donation.category,
            createdAt: donation.createdAt
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
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}
