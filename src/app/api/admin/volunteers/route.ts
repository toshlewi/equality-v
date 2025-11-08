import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import VolunteerApplication from '@/models/VolunteerApplication';
import Job from '@/models/Job';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin', 'editor', 'reviewer'].includes(session.user.role)) {
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
    
    // Job filter
    const jobId = searchParams.get('jobId');
    if (jobId) {
      query.jobId = jobId;
    }
    
    // Search filter (name, email)
    if (filters.search) {
      query.$or = [
        { applicantName: { $regex: filters.search, $options: 'i' } },
        { applicantEmail: { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await VolunteerApplication.countDocuments(query);

    // Fetch applications with pagination
    const applications = await VolunteerApplication.find(query)
      .populate('jobId', 'title slug')
      .populate('reviewedBy', 'name email')
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
      applications: applications.map((app: any) => ({
        id: (app._id as any).toString(),
        jobId: app.jobId ? (typeof app.jobId === 'object' ? app.jobId._id.toString() : app.jobId.toString()) : null,
        jobTitle: app.jobId && typeof app.jobId === 'object' ? app.jobId.title : null,
        applicantName: app.applicantName,
        applicantEmail: app.applicantEmail,
        applicantPhone: app.applicantPhone,
        status: app.status,
        reviewNotes: app.reviewNotes,
        reviewedBy: app.reviewedBy ? (typeof app.reviewedBy === 'object' ? app.reviewedBy.name : null) : null,
        reviewedAt: app.reviewedAt,
        interviewDate: app.interviewDate,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
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
    console.error('Error fetching volunteer applications:', error);
    return ApiResponse.error(
      'Failed to fetch applications',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

