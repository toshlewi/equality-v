import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(20, 'Message must be at least 20 characters').max(2000),
  category: z.enum(['general', 'support', 'partnership', 'media', 'other']).default('general'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = contactSchema.parse(body);

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
      name: sanitizeInput(validatedData.name),
      email: validatedData.email.toLowerCase(),
      phone: validatedData.phone ? sanitizeInput(validatedData.phone) : undefined,
      subject: sanitizeInput(validatedData.subject),
      message: sanitizeInput(validatedData.message),
      category: validatedData.category
    };

    // Create contact record
    const contact = new Contact({
      name: sanitizedData.name,
      email: sanitizedData.email,
      phone: sanitizedData.phone,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      category: sanitizedData.category,
      status: 'new',
      priority: sanitizedData.category === 'support' ? 'high' : 'medium'
    });

    await contact.save();

    // Send confirmation email to user
    try {
      await sendEmail({
        to: sanitizedData.email,
        subject: 'Thank you for contacting Equality Vanguard',
        template: 'contact-confirmation',
        data: {
          name: sanitizedData.name,
          subject: sanitizedData.subject,
          category: sanitizedData.category,
          message: sanitizedData.message
        }
      });
    } catch (emailError) {
      console.error('Error sending contact confirmation email:', emailError);
    }

    // Send notification to admin
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@equalityvanguard.org',
        subject: `New Contact Form Submission: ${sanitizedData.subject}`,
        template: 'admin-notification',
        data: {
          title: 'New Contact Form Submission',
          message: `New contact form submission from ${sanitizedData.name}`,
          type: 'contact_form',
          priority: sanitizedData.category === 'support' ? 'high' : 'medium',
          timestamp: new Date().toLocaleString(),
          details: {
            name: sanitizedData.name,
            email: sanitizedData.email,
            phone: sanitizedData.phone,
            subject: sanitizedData.subject,
            category: sanitizedData.category,
            message: sanitizedData.message
          }
        }
      });
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
    }

    // Create admin notification
    try {
      await createAdminNotification({
        type: 'contact_form',
        title: 'New Contact Form Submission',
        message: `New contact form submission: "${sanitizedData.subject}" from ${sanitizedData.name}`,
        metadata: {
          contactId: contact._id.toString(),
          category: sanitizedData.category,
          priority: sanitizedData.category === 'support' ? 'high' : 'medium'
        },
        priority: sanitizedData.category === 'support' ? 'high' : 'medium',
        category: 'contact',
        actionUrl: `/admin/contacts/${contact._id}`
      });
    } catch (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      data: {
        contactId: contact._id.toString(),
        status: 'new',
        message: 'Your message has been received. We will get back to you soon.'
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (contactId) {
      // Get specific contact
      const contact = await Contact.findById(contactId);
      
      if (!contact) {
        return NextResponse.json(
          { success: false, error: 'Contact not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: contact._id.toString(),
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          status: contact.status,
          createdAt: contact.createdAt
        }
      });
    } else if (email) {
      // Get contacts by email
      const contacts = await Contact.find({ 
        email: email.toLowerCase() 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Contact.countDocuments({ 
        email: email.toLowerCase() 
      });

      return NextResponse.json({
        success: true,
        data: {
          contacts: contacts.map(contact => ({
            id: contact._id.toString(),
            name: contact.name,
            subject: contact.subject,
            status: contact.status,
            createdAt: contact.createdAt
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
      return NextResponse.json(
        { success: false, error: 'Contact ID or email is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
