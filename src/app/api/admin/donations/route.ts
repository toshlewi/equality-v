import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Donation from '@/models/Donation';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer', 'finance'].includes(session.user.role)) {
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
    
    // Donation type filter
    const donationType = searchParams.get('donationType');
    if (donationType) {
      query.donationType = donationType;
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
    
    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Search filter (name, email)
    if (filters.search) {
      query.$or = [
        { donorName: { $regex: filters.search, $options: 'i' } },
        { donorEmail: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get totals for dashboard
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      total,
      totalThisMonth,
      totalLastMonth,
      totalAmount,
      totalAmountThisMonth,
      totalAmountLastMonth,
      completedCount,
      pendingCount
    ] = await Promise.all([
      Donation.countDocuments(query),
      Donation.countDocuments({ ...query, createdAt: { $gte: startOfMonth } }),
      Donation.countDocuments({ ...query, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Donation.aggregate([
        { $match: { ...query, status: 'completed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.aggregate([
        { $match: { ...query, status: 'completed', paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.aggregate([
        { $match: { ...query, status: 'completed', paymentStatus: 'paid', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Donation.countDocuments({ ...query, status: 'completed', paymentStatus: 'paid' }),
      Donation.countDocuments({ ...query, status: 'pending', paymentStatus: 'pending' })
    ]);

    // Fetch donations with pagination
    const donations = await Donation.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiResponse.success({
      donations: donations.map(donation => ({
        id: donation._id.toString(),
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        donationType: donation.donationType,
        status: donation.status,
        paymentStatus: donation.paymentStatus,
        paymentMethod: donation.paymentMethod,
        paymentId: donation.paymentId,
        transactionId: donation.transactionId,
        isAnonymous: donation.isAnonymous,
        receiptSent: donation.receiptSent,
        receiptNumber: donation.receiptNumber,
        createdAt: donation.createdAt,
        updatedAt: donation.updatedAt
      })),
      totals: {
        total,
        totalThisMonth,
        totalLastMonth,
        totalAmount: totalAmount[0]?.total || 0,
        totalAmountThisMonth: totalAmountThisMonth[0]?.total || 0,
        totalAmountLastMonth: totalAmountLastMonth[0]?.total || 0,
        completedCount,
        pendingCount
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
    console.error('Error fetching donations:', error);
    return ApiResponse.error(
      'Failed to fetch donations',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
