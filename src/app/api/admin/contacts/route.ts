import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !(session.user as any)?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes((session.user as any).role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    await connectDB();

    const { page, limit, skip, sort, filters } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    
    // Build query - exclude partnership inquiries (they're handled separately)
    const query: any = { category: { $ne: 'partnership' } };
    
    // Category filter
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }
    
    // Status filter
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Priority filter
    const priority = searchParams.get('priority');
    if (priority) {
      query.priority = priority;
    }
    
    // Search filter (name, email, subject, message)
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

    // Fetch contacts with pagination
    const contacts = await Contact.find(query)
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiResponse.success({
      contacts: (contacts as any[]).map((contact: any) => ({
        id: (contact._id as any).toString(),
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        subject: contact.subject,
        message: contact.message,
        category: contact.category,
        status: contact.status,
        priority: contact.priority,
        metadata: contact.metadata || {},
        notes: contact.notes || '',
        response: contact.response || '',
        respondedAt: contact.respondedAt,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
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
    console.error('Error fetching contacts:', error);
    return ApiResponse.error(
      'Failed to fetch contacts',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

