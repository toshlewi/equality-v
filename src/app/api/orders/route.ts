import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { createPaymentIntent, createCheckoutSession } from '@/lib/stripe';
import { initiateSTKPush } from '@/lib/mpesa';
import { sendEmail } from '@/lib/email';
import { createAdminNotification } from '@/lib/notifications';
import { verifyRecaptcha } from '@/lib/security';
import { sanitizeInput } from '@/lib/auth';

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    variant: z.string().optional()
  })).min(1, 'At least one item is required'),
  customerInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    address: z.object({
      street: z.string().min(5, 'Street address must be at least 5 characters'),
      city: z.string().min(2, 'City must be at least 2 characters'),
      state: z.string().min(2, 'State must be at least 2 characters'),
      postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
      country: z.string().min(2, 'Country must be at least 2 characters')
    })
  }),
  paymentMethod: z.enum(['stripe', 'mpesa']),
  shippingMethod: z.string().default('standard'),
  notes: z.string().max(500).optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
  privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

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
      items: validatedData.items,
      customerInfo: {
        name: sanitizeInput(validatedData.customerInfo.name),
        email: validatedData.customerInfo.email.toLowerCase(),
        phone: validatedData.customerInfo.phone ? sanitizeInput(validatedData.customerInfo.phone) : undefined,
        address: {
          street: sanitizeInput(validatedData.customerInfo.address.street),
          city: sanitizeInput(validatedData.customerInfo.address.city),
          state: sanitizeInput(validatedData.customerInfo.address.state),
          postalCode: sanitizeInput(validatedData.customerInfo.address.postalCode),
          country: sanitizeInput(validatedData.customerInfo.address.country)
        }
      },
      paymentMethod: validatedData.paymentMethod,
      shippingMethod: validatedData.shippingMethod,
      notes: validatedData.notes ? sanitizeInput(validatedData.notes) : undefined
    };

    // Validate products and calculate totals
    const orderItems = [];
    let subtotal = 0;
    let totalItems = 0;

    for (const item of sanitizedData.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Calculate shipping (simplified)
    const shippingCost = sanitizedData.shippingMethod === 'express' ? 15 : 5;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingCost + tax;

    // Create order record
    const order = new Order({
      orderNumber: `EV-${Date.now()}`,
      customerInfo: sanitizedData.customerInfo,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      currency: 'USD',
      paymentMethod: sanitizedData.paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      shippingMethod: sanitizedData.shippingMethod,
      notes: sanitizedData.notes,
      termsAccepted: validatedData.termsAccepted,
      privacyAccepted: validatedData.privacyAccepted
    });

    await order.save();

    // Create payment based on method
    if (validatedData.paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await createPaymentIntent({
        amount: total,
        currency: 'usd',
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          type: 'order'
        },
        customerEmail: sanitizedData.customerInfo.email,
        customerName: sanitizedData.customerInfo.name,
        description: `Order ${order.orderNumber} - Equality Vanguard`
      });

      // Update order with payment ID
      order.paymentId = paymentIntent.id;
      await order.save();

      return NextResponse.json({
        success: true,
        data: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          total,
          currency: 'USD'
        }
      });
    } else if (validatedData.paymentMethod === 'mpesa') {
      // Initiate M-Pesa STK Push
      const stkPushResponse = await initiateSTKPush({
        phone: sanitizedData.customerInfo.phone || sanitizedData.customerInfo.email,
        amount: total,
        accountReference: `order_${order._id.toString()}`,
        transactionDesc: `Order ${order.orderNumber}`,
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/mpesa`
      });

      // Update order with checkout request ID
      order.paymentId = stkPushResponse.CheckoutRequestID;
      await order.save();

      return NextResponse.json({
        success: true,
        data: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          checkoutRequestId: stkPushResponse.CheckoutRequestID,
          merchantRequestId: stkPushResponse.MerchantRequestID,
          total,
          currency: 'USD',
          message: stkPushResponse.CustomerMessage
        }
      });
    }

  } catch (error) {
    console.error('Order creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectDB();

    if (orderId) {
      // Get specific order
      const order = await Order.findOne({
        $or: [
          { _id: orderId },
          { orderNumber: orderId }
        ]
      });
      
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerInfo: order.customerInfo,
          items: order.items,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          tax: order.tax,
          total: order.total,
          currency: order.currency,
          paymentStatus: order.paymentStatus,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } else if (email) {
      // Get orders by email
      const orders = await Order.find({ 
        'customerInfo.email': email.toLowerCase() 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

      const total = await Order.countDocuments({ 
        'customerInfo.email': email.toLowerCase() 
      });

      return NextResponse.json({
        success: true,
        data: {
          orders: orders.map(order => ({
            id: order._id.toString(),
            orderNumber: order.orderNumber,
            customerInfo: order.customerInfo,
            total: order.total,
            currency: order.currency,
            paymentStatus: order.paymentStatus,
            status: order.status,
            createdAt: order.createdAt
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
        { success: false, error: 'Order ID or email is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
