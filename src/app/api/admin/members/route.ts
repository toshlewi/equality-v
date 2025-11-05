import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Member from '@/models/Member';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Check if user has admin access
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
    
    // Membership type filter
    const membershipType = searchParams.get('membershipType');
    if (membershipType) {
      query.membershipType = membershipType;
    }
    
    // Payment status filter
    const paymentStatus = searchParams.get('paymentStatus');
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    // Search filter (name, email, phone)
    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Member.countDocuments(query);

    // Fetch members with pagination
    const members = await Member.find(query)
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
      members: members.map(member => {
        // Handle legacy name field (if stored as single name field)
        let firstName = member.firstName || '';
        let lastName = member.lastName || '';
        if ((member as any).name && !firstName && !lastName) {
          const nameParts = ((member as any).name as string).split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Handle legacy subscription dates
        const joinDate = member.joinDate || (member as any).subscriptionStart || new Date();
        const expiryDate = member.expiryDate || (member as any).subscriptionEnd;
        const paymentMethod = member.paymentMethod || (member as any).paymentProvider;

        return {
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
          amount: member.amount,
          currency: member.currency,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt
        };
      }),
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
    console.error('Error fetching members:', error);
    return ApiResponse.error(
      'Failed to fetch members',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
