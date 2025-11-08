import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
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
    
    // Build query - get Contact records with category='partnership'
    const query: any = { category: 'partnership' };
    
    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Search filter (name, email, subject)
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { subject: { $regex: filters.search, $options: 'i' } },
        { message: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Contact.countDocuments(query);

    // Fetch partnership inquiries with pagination
    const inquiries = await Contact.find(query)
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
      inquiries: inquiries.map((inquiry: any) => ({
        id: inquiry._id?.toString() || '',
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        subject: inquiry.subject,
        message: inquiry.message,
        status: inquiry.status,
        priority: inquiry.priority,
        metadata: inquiry.metadata || {},
        createdAt: inquiry.createdAt,
        updatedAt: inquiry.updatedAt
      })),
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
    console.error('Error fetching partnership inquiries:', error);
    return ApiResponse.error(
      'Failed to fetch partnership inquiries',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
