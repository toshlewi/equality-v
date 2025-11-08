import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'finance'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const { page, limit, skip, sort, filters } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    // Build query filters
    const query: any = {};
    
    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Payment status filter
    const paymentStatus = searchParams.get('paymentStatus');
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Payment method filter
    const paymentMethod = searchParams.get('paymentMethod');
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    // Search filter (order number, customer email, customer name)
    if (filters.search) {
      query.$or = [
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { 'customerInfo.email': { $regex: filters.search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: filters.search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'name email')
      .populate('shippedBy', 'name email')
      .select('-__v')
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Calculate totals
    const totals = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const stats = totals[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };

    return ApiResponse.success({
      orders: orders.map((order: any) => ({
        id: order._id?.toString() || '',
        orderNumber: order.orderNumber,
        customerInfo: order.customerInfo,
        items: order.items || [],
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      stats: {
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        averageOrderValue: stats.averageOrderValue
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return ApiResponse.error(
      'Failed to fetch orders',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

