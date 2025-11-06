import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { addSubscriber } from '@/lib/mailchimp';
import { createAuditLog } from '@/lib/audit';

const updateMemberSchema = z.object({
  status: z.enum(['pending', 'active', 'suspended', 'cancelled']).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional()
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

    const member = await Member.findById(params.id).lean();

    if (!member) {
      return ApiResponse.notFound('Member not found');
    }

    // Handle legacy fields
    let firstName = member.firstName || '';
    let lastName = member.lastName || '';
    if ((member as any).name && !firstName && !lastName) {
      const nameParts = ((member as any).name as string).split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }
    
    const joinDate = member.joinDate || (member as any).subscriptionStart || new Date();
    const expiryDate = member.expiryDate || (member as any).subscriptionEnd;
    const paymentMethod = member.paymentMethod || (member as any).paymentProvider;

    return ApiResponse.success({
      id: member._id.toString(),
      firstName,
      lastName,
      email: member.email,
      phone: member.phone,
      membershipType: member.membershipType,
      status: member.status,
      isActive: member.isActive,
      joinDate,
      expiryDate,
      paymentStatus: member.paymentStatus,
      paymentMethod,
      paymentId: member.paymentId,
      amount: member.amount,
      currency: member.currency,
      address: member.address,
      organization: member.organization,
      interests: member.interests,
      newsletter: member.newsletter,
      emergencyContact: member.emergencyContact,
      notes: member.notes,
      lastLogin: member.lastLogin,
      profileImage: member.profileImage,
      documents: member.documents,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    });

  } catch (error) {
    console.error('Error fetching member:', error);
    return ApiResponse.error(
      'Failed to fetch member',
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

    if (!['admin', 'editor', 'finance'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updateMemberSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const member = await Member.findById(params.id);

    if (!member) {
      return ApiResponse.notFound('Member not found');
    }

    // Track if status changed to active for email notification
    const wasActive = member.isActive;
    const statusChanged = body.status && body.status !== member.status;

    // Prevent manual activation without verified payment
    if (body.isActive === true && member.paymentStatus !== 'paid') {
      return ApiResponse.validationError({
        isActive: 'Cannot activate membership without verified payment. Payment status must be "paid".'
      });
    }

    // Prevent setting status to 'active' without verified payment
    if (body.status === 'active' && member.paymentStatus !== 'paid') {
      return ApiResponse.validationError({
        status: 'Cannot set status to "active" without verified payment. Payment status must be "paid".'
      });
    }

    // If activating, ensure payment was verified
    if ((body.isActive === true || body.status === 'active') && member.paymentStatus !== 'paid') {
      return ApiResponse.validationError({
        isActive: 'Membership can only be activated after payment is verified and confirmed. Current payment status: ' + member.paymentStatus
      });
    }

    // Update member
    if (body.status !== undefined) member.status = body.status;
    if (body.isActive !== undefined) {
      // Only allow activation if payment is verified
      if (body.isActive === true && member.paymentStatus !== 'paid') {
        return ApiResponse.validationError({
          isActive: 'Cannot activate membership. Payment must be verified first.'
        });
      }
      member.isActive = body.isActive;
    }
    if (body.notes !== undefined) member.notes = body.notes;

    await member.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Member ${member._id.toString()} updated`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          memberId: member._id.toString(),
          oldStatus: member.status,
          newStatus: body.status !== undefined ? body.status : member.status,
          oldIsActive: wasActive,
          newIsActive: member.isActive
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    // Send confirmation email if activated
    if (!wasActive && member.isActive && member.status === 'active') {
      try {
        // Get member name (handle legacy fields)
        const memberName = member.firstName && member.lastName
          ? `${member.firstName} ${member.lastName}`
          : (member as any).name || member.email;
        
        const joinDate = member.joinDate || (member as any).subscriptionStart || new Date();
        const expiryDate = member.expiryDate || (member as any).subscriptionEnd;

        await sendEmail({
          to: member.email,
          subject: 'Equality Vanguard Membership Confirmed',
          template: 'membership-confirmation',
          data: {
            name: memberName,
            membershipType: member.membershipType,
            joinDate: new Date(joinDate).toLocaleDateString(),
            expiryDate: expiryDate ? new Date(expiryDate).toLocaleDateString() : 'Lifetime',
            amount: member.amount,
            currency: member.currency
          }
        });

        // Add to Mailchimp if newsletter is enabled
        if (member.newsletter && process.env.MAILCHIMP_LIST_ID) {
          try {
            await addSubscriber(process.env.MAILCHIMP_LIST_ID, {
              email: member.email,
              name: memberName,
              tags: [`member_${member.membershipType}`, 'member'],
              status: 'subscribed'
            });
          } catch (mailchimpError) {
            console.error('Mailchimp error:', mailchimpError);
            // Don't fail the request if Mailchimp fails
          }
        }
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return ApiResponse.success({
      id: member._id.toString(),
      status: member.status,
      isActive: member.isActive,
      notes: member.notes,
      updatedAt: member.updatedAt
    });

  } catch (error) {
    console.error('Error updating member:', error);
    return ApiResponse.error(
      'Failed to update member',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins can delete members');
    }

    await connectDB();

    const member = await Member.findById(params.id);

    if (!member) {
      return ApiResponse.notFound('Member not found');
    }

    // Soft delete: set status to cancelled and isActive to false
    member.status = 'cancelled';
    member.isActive = false;
    await member.save();

    return ApiResponse.success({
      message: 'Member cancelled successfully',
      id: member._id.toString()
    });

  } catch (error) {
    console.error('Error cancelling member:', error);
    return ApiResponse.error(
      'Failed to cancel member',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
