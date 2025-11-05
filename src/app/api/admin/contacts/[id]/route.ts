import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/audit';

const updateContactSchema = z.object({
  status: z.enum(['new', 'read', 'responded', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().optional(),
  response: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const contact = await Contact.findById(params.id).lean();

    if (!contact) {
      return ApiResponse.notFound('Contact not found');
    }

    return ApiResponse.success({
      id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      category: contact.category,
      status: contact.status,
      priority: contact.priority,
      metadata: contact.metadata || {},
      notes: contact.notes || '',
      response: contact.response || '',
      respondedAt: contact.respondedAt,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    return ApiResponse.error(
      'Failed to fetch contact',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updateContactSchema, body);
    
    if (!validation.success) {
      return ApiResponse.validationError(
        validation.errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {} as Record<string, string>)
      );
    }

    const contact = await Contact.findById(params.id);

    if (!contact) {
      return ApiResponse.notFound('Contact not found');
    }

    const oldStatus = contact.status;
    const oldPriority = contact.priority;

    // Update fields
    if (body.status !== undefined) contact.status = body.status;
    if (body.priority !== undefined) contact.priority = body.priority;
    if (body.notes !== undefined) contact.notes = body.notes;
    if (body.response !== undefined) {
      contact.response = body.response;
      if (body.response && !contact.respondedAt) {
        contact.respondedAt = new Date();
      }
    }

    await contact.save();

    // Log audit trail
    await createAuditLog({
      eventType: 'contact_updated',
      description: `Contact ${contact.subject} updated`,
      userId: session.user.id,
      userEmail: session.user.email || '',
      userRole: session.user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestMethod: 'PATCH',
      requestUrl: request.url,
      metadata: {
        contactId: contact._id.toString(),
        oldStatus,
        newStatus: contact.status,
        oldPriority,
        newPriority: contact.priority
      },
      severity: 'low',
      status: 'success'
    });

    // Send response email if provided
    if (body.response && body.response.trim() && contact.email) {
      try {
        await sendEmail({
          to: contact.email,
          subject: `Re: ${contact.subject}`,
          template: 'contact-response',
          data: {
            name: contact.name,
            subject: contact.subject,
            response: body.response,
            originalMessage: contact.message
          }
        });
      } catch (emailError) {
        console.error('Error sending response email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return ApiResponse.success({
      id: contact._id.toString(),
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      status: contact.status,
      priority: contact.priority,
      notes: contact.notes,
      response: contact.response,
      respondedAt: contact.respondedAt,
      updatedAt: contact.updatedAt
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return ApiResponse.error(
      'Failed to update contact',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

