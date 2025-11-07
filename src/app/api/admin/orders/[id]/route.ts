import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { ApiResponse, validateRequest } from '@/lib/api-utils';
import { z } from 'zod';
import Stripe from 'stripe';
import { createAuditLog } from '@/lib/audit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
  carrier: z.string().optional(),
  notes: z.string().optional(),
  specialInstructions: z.string().optional()
});

const refundOrderSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive').optional(),
  reason: z.string().min(1, 'Reason is required')
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!user.role || !['admin', 'editor', 'finance'].includes(user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const order = await Order.findOne({
      $or: [
        { _id: id },
        { orderNumber: id }
      ]
    })
      .populate('processedBy', 'name email')
      .populate('shippedBy', 'name email')
      .populate('items.productId', 'name slug images')
      .lean();

    if (!order) {
      return ApiResponse.notFound('Order not found');
    }

    return ApiResponse.success({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerInfo: order.customerInfo,
      items: order.items || [],
      subtotal: order.subtotal,
      tax: order.tax,
      taxRate: order.taxRate,
      shipping: order.shipping,
      discount: order.discount,
      couponCode: order.couponCode,
      couponDiscount: order.couponDiscount,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentId: order.paymentId,
      transactionId: order.transactionId,
      paymentIntentId: order.paymentIntentId,
      shippingMethod: order.shippingMethod,
      shippingCost: order.shippingCost,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
      specialInstructions: order.specialInstructions,
      refunds: order.refunds || [],
      emailsSent: order.emailsSent || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      processedAt: order.processedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return ApiResponse.error(
      'Failed to fetch order',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!user.role || !['admin', 'editor', 'finance'].includes(user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const body = await request.json();
    const validation = validateRequest(updateOrderSchema, body);

    if (!validation.success) {
      return ApiResponse.validationError(validation.errors);
    }

    const order = await Order.findById(id);

    if (!order) {
      return ApiResponse.notFound('Order not found');
    }

    // Track status changes
    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;

    // Update order
    if (validation.data.status !== undefined) {
      order.status = validation.data.status;
      
      // Update timestamps based on status
      if (validation.data.status === 'confirmed' && !order.processedAt) {
        order.processedAt = new Date();
        order.processedBy = user.id;
      } else if (validation.data.status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
        order.shippedBy = user.id;
      } else if (validation.data.status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (validation.data.paymentStatus !== undefined) {
      order.paymentStatus = validation.data.paymentStatus;
    }

    if (validation.data.trackingNumber !== undefined) {
      order.trackingNumber = validation.data.trackingNumber;
    }

    if (validation.data.trackingUrl !== undefined) {
      order.trackingUrl = validation.data.trackingUrl;
    }

    if (validation.data.carrier !== undefined) {
      order.carrier = validation.data.carrier;
    }

    if (validation.data.notes !== undefined) {
      order.notes = validation.data.notes;
    }

    if (validation.data.specialInstructions !== undefined) {
      order.specialInstructions = validation.data.specialInstructions;
    }

    await order.save();

    // Log audit trail
    try {
      await createAuditLog({
        eventType: 'admin_action',
        description: `Order ${order.orderNumber} updated`,
        userId: user.id,
        userEmail: user.email || '',
        userRole: user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'PATCH',
        requestUrl: request.url,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          oldStatus,
          newStatus: order.status,
          oldPaymentStatus,
          newPaymentStatus: order.paymentStatus
        },
        severity: 'low',
        status: 'success'
      });
    } catch (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log fails
    }

    // TODO: Send status update email if status changed

    return ApiResponse.success({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      updatedAt: order.updatedAt
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return ApiResponse.error(
      'Failed to update order',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!user.role || !['admin', 'finance'].includes(user.role)) {
      return ApiResponse.forbidden('Only admins and finance can process refunds');
    }

    await connectDB();

    const body = await request.json();
    const { action } = body;

    if (action === 'refund') {
      const validation = validateRequest(refundOrderSchema, body);

      if (!validation.success) {
        return ApiResponse.validationError(validation.errors);
      }

      const order = await Order.findById(id);

      if (!order) {
        return ApiResponse.notFound('Order not found');
      }

      if (order.paymentStatus !== 'paid') {
        return ApiResponse.error(
          'Order must be paid before refunding',
          400,
          'Order payment status is not paid'
        );
      }

      const refundAmount = validation.data.amount || order.total;
      const refundReason = validation.data.reason;

      // Process refund via Stripe if payment method is Stripe
      let refundId: string | null = null;

      if (order.paymentMethod === 'stripe' && order.paymentIntentId) {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: order.paymentIntentId,
            amount: Math.round(refundAmount * 100), // Convert to cents
            reason: refundReason === 'requested_by_customer' ? 'requested_by_customer' : 'duplicate',
            metadata: {
              orderId: order._id.toString(),
              orderNumber: order.orderNumber,
              refundReason: refundReason
            }
          });

          refundId = refund.id;
        } catch (stripeError: any) {
          console.error('Stripe refund error:', stripeError);
          return ApiResponse.error(
            'Failed to process Stripe refund',
            500,
            stripeError.message || 'Stripe refund failed'
          );
        }
      }

      // Add refund to order
      order.refunds.push({
        amount: refundAmount,
        reason: refundReason,
        status: refundId ? 'processed' : 'pending',
        processedBy: user.id,
        processedAt: new Date(),
        refundId: refundId || undefined,
        notes: `Refund processed by ${user.email ?? 'unknown'}`
      });

      // Update payment status
      const totalRefunded = order.refunds
        .filter((r: any) => r.status === 'processed')
        .reduce((sum: number, r: any) => sum + r.amount, 0) + refundAmount;

      if (totalRefunded >= order.total) {
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
      } else if (totalRefunded > 0) {
        order.paymentStatus = 'partially_refunded';
      }

      await order.save();

      // TODO: Send refund confirmation email

      return ApiResponse.success({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        refundId,
        refundAmount,
        refundReason,
        paymentStatus: order.paymentStatus,
        updatedAt: order.updatedAt
      });

    } else {
      return ApiResponse.error(
        'Invalid action',
        400,
        'Action must be "refund"'
      );
    }

  } catch (error) {
    console.error('Error processing refund:', error);
    return ApiResponse.error(
      'Failed to process refund',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

