import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
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
    
    // Type filter
    const type = searchParams.get('type');
    if (type) {
      query.type = type;
    }
    
    // Department filter
    const department = searchParams.get('department');
    if (department) {
      query.department = department;
    }
    
    // Location filter
    const location = searchParams.get('location');
    if (location) {
      query.location = location;
    }
    
    // Search filter
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Fetch jobs with pagination
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .select('-__v')
      .lean();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return ApiResponse.success({
      jobs: jobs.map(job => ({
        id: job._id.toString(),
        title: job.title,
        slug: job.slug,
        description: job.description,
        shortDescription: job.shortDescription,
        department: job.department,
        type: job.type,
        location: job.location,
        status: job.status,
        isPublic: job.isPublic,
        isFeatured: job.isFeatured,
        applicationCount: job.applicationCount || 0,
        applicationDeadline: job.applicationDeadline,
        startDate: job.startDate,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
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
    console.error('Error fetching jobs:', error);
    return ApiResponse.error(
      'Failed to fetch jobs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

