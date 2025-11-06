import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { createPaymentIntent } from '@/lib/stripe';
import { initiateSTKPush } from '@/lib/mpesa';
import { sendEmail } from '@/lib/email';
import { generateICSFile } from '@/lib/calendar';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/recaptcha';
import { sanitizeInput } from '@/lib/auth';
import { formRateLimit } from '@/middleware/rate-limit';

const registrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  attendeeName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeePhone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  ticketCount: z.number().int().min(1, 'At least one ticket is required').default(1),
  ticketType: z.string().optional(),
  paymentMethod: z.enum(['stripe', 'mpesa', 'free']),
  discountCode: z.string().optional(),
  specialRequirements: z.string().max(500).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  registrationData: z.record(z.any()).optional(),
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
    const validatedData = registrationSchema.parse(body);

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(validatedData.recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify event exists and is available
    const event = await Event.findById(validatedData.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Event is not available for registration' },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Registration deadline has passed' },
        { status: 400 }
      );
    }

    // Check capacity
    if (event.capacity && event.registeredCount + validatedData.ticketCount > event.capacity) {
      if (event.allowWaitlist) {
        // Add to waitlist
        event.waitlistCount = (event.waitlistCount || 0) + validatedData.ticketCount;
        await event.save();
        
        return NextResponse.json({
          success: true,
          data: {
            status: 'waitlist',
            message: 'Event is full. You have been added to the waitlist.'
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Event is full' },
          { status: 400 }
        );
      }
    }

    // Calculate price
    let basePrice = event.isFree ? 0 : (event.price || 0);
    let discountAmount = 0;
    let discountCode = validatedData.discountCode;

    // Apply discount code if provided
    if (discountCode && event.ticketInfo?.discountCodes) {
      const discount = event.ticketInfo.discountCodes.find(
        (dc: any) => dc.code.toLowerCase() === discountCode!.toLowerCase() &&
        (!dc.expiresAt || new Date(dc.expiresAt) > new Date())
      );

      if (discount) {
        if (discount.percentOff) {
          discountAmount = (basePrice * discount.percentOff) / 100;
        } else if (discount.amountOff) {
          discountAmount = discount.amountOff;
        }
      } else {
        discountCode = undefined; // Invalid discount code
      }
    }

    const totalPrice = Math.max(0, (basePrice - discountAmount) * validatedData.ticketCount);
    const currency = event.currency || 'USD';

    // Sanitize input
    const sanitizedData = {
      eventId: validatedData.eventId,
      attendeeName: sanitizeInput(validatedData.attendeeName),
      attendeeEmail: validatedData.attendeeEmail.toLowerCase(),
      attendeePhone: validatedData.attendeePhone ? sanitizeInput(validatedData.attendeePhone) : undefined,
      ticketCount: validatedData.ticketCount,
      ticketType: validatedData.ticketType,
      paymentMethod: validatedData.paymentMethod,
      discountCode,
      discountAmount,
      amount: totalPrice,
      currency,
      specialRequirements: validatedData.specialRequirements ? sanitizeInput(validatedData.specialRequirements) : undefined,
      dietaryRestrictions: validatedData.dietaryRestrictions ? sanitizeInput(validatedData.dietaryRestrictions) : undefined,
      emergencyContact: validatedData.emergencyContact,
      registrationData: validatedData.registrationData,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Create registration record
    const registration = new EventRegistration({
      ...sanitizedData,
      paymentStatus: totalPrice === 0 ? 'paid' : 'pending',
      status: totalPrice === 0 ? 'confirmed' : 'pending'
    });
    await registration.save();

    // Update event registration count
    if (totalPrice === 0 || validatedData.paymentMethod === 'free') {
      event.registeredCount = (event.registeredCount || 0) + validatedData.ticketCount;
      await event.save();
    }

    // Handle payment if required
    if (totalPrice > 0 && validatedData.paymentMethod !== 'free') {
      if (validatedData.paymentMethod === 'stripe') {
        // Create Stripe PaymentIntent
        const paymentIntent = await createPaymentIntent({
          amount: Math.round(totalPrice * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            registrationId: registration._id.toString(),
            eventId: event._id.toString(),
            eventTitle: event.title,
            attendeeName: sanitizedData.attendeeName,
            attendeeEmail: sanitizedData.attendeeEmail,
            ticketCount: validatedData.ticketCount.toString(),
            type: 'event_registration'
          },
          customerEmail: sanitizedData.attendeeEmail,
          customerName: sanitizedData.attendeeName,
          description: `Event Registration: ${event.title} - ${validatedData.ticketCount} ticket(s)`
        });

        registration.paymentIntentId = paymentIntent.id;
        registration.paymentId = paymentIntent.id;
        await registration.save();

        return NextResponse.json({
          success: true,
          data: {
            registrationId: registration._id.toString(),
            confirmationCode: registration.confirmationCode,
            status: 'pending_payment',
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: totalPrice,
            currency
          }
        });

      } else if (validatedData.paymentMethod === 'mpesa') {
        // For M-Pesa, don't initiate STK Push here
        // The user will initiate it from the payment step
        return NextResponse.json({
          success: true,
          data: {
            registrationId: registration._id.toString(),
            confirmationCode: registration.confirmationCode,
            status: 'pending_payment',
            amount: totalPrice,
            currency: 'KES',
            message: 'Registration created. Please proceed to payment.'
          }
        });
      }
    }

    // Free event - send confirmation immediately
    // Generate ICS file
    const icsFile = generateICSFile({
      title: event.title,
      description: event.description || event.shortDescription || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: event.location?.isVirtual 
        ? event.location.virtualLink || event.location.name || ''
        : event.location?.address || event.location?.name || '',
      organizer: event.organizer ? {
        name: event.organizer.name || 'Equality Vanguard',
        email: event.organizer.email || 'events@equalityvanguard.org'
      } : {
        name: 'Equality Vanguard',
        email: 'events@equalityvanguard.org'
      },
      attendee: {
        name: sanitizedData.attendeeName,
        email: sanitizedData.attendeeEmail
      },
      url: `${process.env.NEXTAUTH_URL}/events/${event.slug}`,
      uid: `event-reg-${registration._id.toString()}`
    });

    // Send confirmation email with ICS attachment
    try {
      await sendEmail({
        to: sanitizedData.attendeeEmail,
        subject: `Event Registration Confirmed - ${event.title}`,
        template: 'event-registration',
        data: {
          name: sanitizedData.attendeeName,
          eventTitle: event.title,
          eventDate: new Date(event.startDate).toLocaleDateString(),
          eventTime: event.startTime || '',
          eventLocation: event.location?.isVirtual 
            ? event.location.virtualLink || 'Virtual Event'
            : event.location?.address || event.location?.name || 'TBA',
          ticketCount: validatedData.ticketCount,
          confirmationCode: registration.confirmationCode,
          amount: totalPrice,
          currency
        },
        attachments: [{
          filename: icsFile.filename,
          data: icsFile.buffer,
          contentType: 'text/calendar'
        }]
      });
      registration.confirmationEmailSent = true;
      registration.confirmationEmailSentAt = new Date();
      await registration.save();
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Create admin notification
    try {
      await createAdminNotification({
        type: 'event_registration',
        title: 'New Event Registration',
        message: `New registration for ${event.title} from ${sanitizedData.attendeeName}`,
        metadata: {
          registrationId: registration._id.toString(),
          eventId: event._id.toString(),
          eventTitle: event.title,
          attendeeName: sanitizedData.attendeeName,
          attendeeEmail: sanitizedData.attendeeEmail,
          ticketCount: validatedData.ticketCount
        },
        priority: 'medium',
        category: 'events',
        actionUrl: `/admin/events/${event._id}/registrations/${registration._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: {
        registrationId: registration._id.toString(),
        confirmationCode: registration.confirmationCode,
        status: 'confirmed',
        amount: totalPrice,
        currency
      }
    });

  } catch (error) {
    console.error('Event registration error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}
