import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { addSubscriber } from '@/lib/mailchimp';
import { createAuditLog } from '@/lib/audit';

const updatePartnershipSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']).optional(),
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

    if (!['admin', 'editor', 'reviewer', 'finance'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const inquiry = await Contact.findOne({ 
      _id: params.id,
      category: 'partnership'
    }).lean();

    if (!inquiry) {
      return ApiResponse.notFound('Partnership inquiry not found');
    }

      return ApiResponse.success({
      id: inquiry._id.toString(),
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      message: inquiry.message,
      status: inquiry.status,
      priority: inquiry.priority,
      category: inquiry.category,
      metadata: inquiry.metadata || {},
      notes: inquiry.notes || '',
      response: inquiry.response || '',
      respondedAt: inquiry.respondedAt,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt
    });

  } catch (error) {
    console.error('Error fetching partnership inquiry:', error);
    return ApiResponse.error(
      'Failed to fetch partnership inquiry',
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

    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updatePartnershipSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const inquiry = await Contact.findOne({ 
      _id: params.id,
      category: 'partnership'
    });

    if (!inquiry) {
      return ApiResponse.notFound('Partnership inquiry not found');
    }

    // Track if status changed
    const oldStatus = inquiry.status;
    const statusChanged = body.status && body.status !== inquiry.status;

    // Update inquiry
    if (body.status !== undefined) inquiry.status = body.status;
    if (body.priority !== undefined) inquiry.priority = body.priority;
    if (body.notes !== undefined) inquiry.notes = body.notes;
    if (body.response !== undefined) {
      inquiry.response = body.response;
      inquiry.respondedAt = new Date();
      inquiry.respondedBy = session.user.id;
    }

    await inquiry.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Partnership inquiry ${inquiry._id.toString()} updated`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          inquiryId: inquiry._id.toString(),
          oldStatus,
          newStatus: inquiry.status,
          organizationName: inquiry.metadata?.organizationName || inquiry.subject?.replace('Partnership Inquiry: ', '')
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    // Send email notification if status changed
    if (statusChanged && (body.status === 'contacted' || body.status === 'in_progress' || body.status === 'declined')) {
      try {
        const orgName = inquiry.metadata?.organizationName || inquiry.subject?.replace('Partnership Inquiry: ', '') || 'your organization';
        
        await sendEmail({
          to: inquiry.email,
          subject: `Partnership Inquiry Update - ${orgName}`,
          template: 'partnership-status-update',
          data: {
            organizationName: orgName,
            contactName: inquiry.name,
            status: body.status,
            notes: body.notes || ''
          }
        });
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Add to Mailchimp if status is in_progress or resolved
    if ((body.status === 'in_progress' || body.status === 'resolved') && process.env.MAILCHIMP_LIST_ID) {
      try {
        await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
          email: inquiry.email,
          name: inquiry.name,
          tags: ['partner', 'partnership_inquiry'],
          status: 'subscribed'
        });
      } catch (mailchimpError) {
        console.error('Mailchimp error:', mailchimpError);
        // Don't fail the request if Mailchimp fails
      }
    }

    return ApiResponse.success({
      id: inquiry._id.toString(),
      status: inquiry.status,
      priority: inquiry.priority,
      notes: inquiry.notes,
      updatedAt: inquiry.updatedAt
    });

  } catch (error) {
    console.error('Error updating partnership inquiry:', error);
    return ApiResponse.error(
      'Failed to update partnership inquiry',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
