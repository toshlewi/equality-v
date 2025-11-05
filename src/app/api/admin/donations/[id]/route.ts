import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donation';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import { sendEmail } from '@/lib/email';
import { processRefund } from '@/lib/stripe';
import { addSubscriber } from '@/lib/mailchimp';
import { createAuditLog } from '@/lib/audit';

const updateDonationSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  notes: z.string().optional()
});

const refundSchema = z.object({
  reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
  amount: z.number().optional()
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

    const donation = await Donation.findById(params.id).lean();

    if (!donation) {
      return ApiResponse.notFound('Donation not found');
    }

    return ApiResponse.success({
      id: donation._id.toString(),
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amount: donation.amount,
      currency: donation.currency,
      donationType: donation.donationType,
      campaign: donation.campaign,
      status: donation.status,
      paymentStatus: donation.paymentStatus,
      paymentMethod: donation.paymentMethod,
      paymentId: donation.paymentId,
      transactionId: donation.transactionId,
      isAnonymous: donation.isAnonymous,
      message: donation.message,
      address: donation.address,
      taxDeductible: donation.taxDeductible,
      receiptSent: donation.receiptSent,
      receiptNumber: donation.receiptNumber,
      notes: donation.notes,
      recurring: donation.recurring,
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    return ApiResponse.error(
      'Failed to fetch donation',
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
    const validation = validateRequest(updateDonationSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const donation = await Donation.findById(params.id);

    if (!donation) {
      return ApiResponse.notFound('Donation not found');
    }

    // Track old status for audit log
    const oldStatus = donation.status;

    // Update donation
    if (body.status !== undefined) donation.status = body.status;
    if (body.notes !== undefined) donation.notes = body.notes;

    await donation.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Donation ${donation._id.toString()} updated`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          donationId: donation._id.toString(),
          oldStatus,
          newStatus: donation.status,
          amount: donation.amount,
          currency: donation.currency
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    return ApiResponse.success({
      id: donation._id.toString(),
      status: donation.status,
      notes: donation.notes,
      updatedAt: donation.updatedAt
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    return ApiResponse.error(
      'Failed to update donation',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'finance'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins and finance can process refunds');
    }

    await connectDB();

    const body = await request.json();
    const action = body.action;

    if (action === 'resend_receipt') {
      const donation = await Donation.findById(params.id);

      if (!donation) {
        return ApiResponse.notFound('Donation not found');
      }

      if (donation.status !== 'completed' || donation.paymentStatus !== 'paid') {
        return ApiResponse.error('Can only resend receipts for completed paid donations', 400);
      }

      // Generate receipt number if not exists
      if (!donation.receiptNumber) {
        donation.receiptNumber = `EV-${donation._id.toString().slice(-8).toUpperCase()}`;
        await donation.save();
      }

      // Send receipt email
      try {
        await sendEmail({
          to: donation.donorEmail,
          subject: `Donation Receipt - ${donation.receiptNumber}`,
          template: 'donation-receipt',
          data: {
            donorName: donation.donorName,
            amount: donation.amount,
            currency: donation.currency,
            receiptNumber: donation.receiptNumber,
            donationDate: donation.createdAt.toLocaleDateString(),
            taxDeductible: donation.taxDeductible,
            organizationName: 'Equality Vanguard',
            organizationAddress: 'Nairobi, Kenya',
            organizationTaxId: process.env.ORG_TAX_ID || 'N/A'
          }
        });

        donation.receiptSent = true;
        await donation.save();

        return ApiResponse.success({
          message: 'Receipt sent successfully',
          receiptNumber: donation.receiptNumber
        });
      } catch (emailError) {
        console.error('Error sending receipt email:', emailError);
        return ApiResponse.error('Failed to send receipt email', 500);
      }
    } else if (action === 'refund') {
      const validation = validateRequest(refundSchema, body);
      
      if (!validation.success) {
        return ApiResponse.validationError(validation.errors);
      }

      const donation = await Donation.findById(params.id);

      if (!donation) {
        return ApiResponse.notFound('Donation not found');
      }

      if (donation.status === 'refunded') {
        return ApiResponse.error('Donation already refunded', 400);
      }

      if (donation.paymentMethod !== 'stripe' || !donation.paymentId) {
        return ApiResponse.error('Can only refund Stripe payments', 400);
      }

      // Process refund via Stripe
      try {
        const refund = await processRefund(
          donation.paymentId,
          body.amount ? body.amount : undefined,
          body.reason || 'requested_by_customer'
        );

        // Update donation
        donation.status = 'refunded';
        donation.paymentStatus = 'refunded';
        donation.notes = donation.notes 
          ? `${donation.notes}\n\nRefunded: ${new Date().toLocaleString()} - ${body.reason || 'requested_by_customer'}`
          : `Refunded: ${new Date().toLocaleString()} - ${body.reason || 'requested_by_customer'}`;
        donation.transactionId = refund.id;
        await donation.save();

        // Log audit trail for refund
        try {
          await createAuditLog({
            eventType: 'admin_action',
            description: `Donation ${donation._id.toString()} refunded`,
            userId: session.user.id,
            userEmail: session.user.email || '',
            userRole: session.user.role,
            ipAddress: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            requestMethod: 'POST',
            requestUrl: request.url,
            metadata: {
              donationId: donation._id.toString(),
              refundId: refund.id,
              refundAmount: body.amount || donation.amount,
              reason: body.reason || 'requested_by_customer',
              amount: donation.amount,
              currency: donation.currency
            },
            severity: 'medium',
            status: 'success'
          });
        } catch (auditError) {
          console.error('Error creating audit log:', auditError);
          // Don't fail the request if audit log fails
        }

        // Send refund confirmation email
        try {
          await sendEmail({
            to: donation.donorEmail,
            subject: 'Donation Refund Confirmation',
            template: 'donation-refund',
            data: {
              donorName: donation.donorName,
              amount: donation.amount,
              currency: donation.currency,
              refundId: refund.id,
              refundDate: new Date().toLocaleDateString()
            }
          });
        } catch (emailError) {
          console.error('Error sending refund email:', emailError);
          // Don't fail the request if email fails
        }

        return ApiResponse.success({
          message: 'Refund processed successfully',
          refundId: refund.id,
          amount: refund.amount / 100, // Convert from cents
          currency: refund.currency
        });
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        return ApiResponse.error(
          'Failed to process refund',
          500,
          refundError instanceof Error ? refundError.message : 'Unknown error'
        );
      }
    } else {
      return ApiResponse.error('Invalid action', 400);
    }

  } catch (error) {
    console.error('Error processing donation action:', error);
    return ApiResponse.error(
      'Failed to process action',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
