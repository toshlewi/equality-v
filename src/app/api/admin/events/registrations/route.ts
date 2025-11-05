import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import EventRegistration from '@/models/EventRegistration';
import Event from '@/models/Event';
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
    
    // Event filter
    const eventId = searchParams.get('eventId');
    if (eventId) {
      query.eventId = eventId;
    }
    
    // Search filter (attendee name, email, confirmation code)
    if (filters.search) {
      query.$or = [
        { attendeeName: { $regex: filters.search, $options: 'i' } },
        { attendeeEmail: { $regex: filters.search, $options: 'i' } },
        { confirmationCode: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await EventRegistration.countDocuments(query);

    // Fetch registrations with pagination
    const registrations = await EventRegistration.find(query)
      .populate('eventId', 'title slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Calculate totals
    const totals = await EventRegistration.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalRegistrations: { $sum: 1 },
          paidRegistrations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingRegistrations: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    const stats = totals[0] || {
      totalRevenue: 0,
      totalRegistrations: 0,
      paidRegistrations: 0,
      pendingRegistrations: 0
    };

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiResponse.success({
      registrations: registrations.map((registration: any) => ({
        id: registration._id.toString(),
        eventId: registration.eventId?._id?.toString() || registration.eventId?.toString(),
        eventTitle: (registration.eventId as any)?.title || 'Unknown Event',
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        attendeePhone: registration.attendeePhone,
        ticketCount: registration.ticketCount,
        ticketType: registration.ticketType,
        amount: registration.amount,
        currency: registration.currency || 'USD',
        paymentStatus: registration.paymentStatus,
        paymentMethod: registration.paymentMethod,
        status: registration.status,
        confirmationCode: registration.confirmationCode,
        discountCode: registration.discountCode,
        discountAmount: registration.discountAmount || 0,
        checkedIn: registration.checkedIn || false,
        checkedInAt: registration.checkedInAt,
        confirmationEmailSent: registration.confirmationEmailSent || false,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt
      })),
      totals: {
        totalRevenue: stats.totalRevenue,
        totalRegistrations: stats.totalRegistrations,
        paidRegistrations: stats.paidRegistrations,
        pendingRegistrations: stats.pendingRegistrations
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
    console.error('Error fetching event registrations:', error);
    return ApiResponse.error(
      'Failed to fetch event registrations',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

