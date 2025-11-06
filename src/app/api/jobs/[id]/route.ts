import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { z } from 'zod';

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.string().max(300).optional(),
  department: z.enum(['advocacy', 'legal', 'communications', 'programs', 'operations', 'finance', 'other']).optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'volunteer']).optional(),
  location: z.enum(['remote', 'hybrid', 'on-site']).optional(),
  status: z.enum(['draft', 'open', 'closed', 'filled']).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  applicationDeadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const job = await Job.findOne({ 
      $or: [{ _id: id }, { slug: id }]
    }).lean();

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is public (for non-admin)
    const session = await getServerSession(authOptions);
    if ((!job.isPublic || job.status !== 'open') && (!session || !['admin', 'editor'].includes(session.user.role))) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update job
    Object.assign(job, validatedData);
    
    if (validatedData.applicationDeadline) {
      job.applicationDeadline = new Date(validatedData.applicationDeadline);
    }
    if (validatedData.startDate) {
      job.startDate = new Date(validatedData.startDate);
    }
    
    job.updatedBy = session.user.id;
    await job.save();

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job updated successfully'
    });

  } catch (error) {
    console.error('Error updating job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Only admins can delete jobs' },
        { status: 403 }
      );
    }

    await connectDB();

    const job = await Job.findById(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Soft delete: set status to closed
    job.status = 'closed';
    job.isPublic = false;
    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Job closed successfully'
    });

  } catch (error) {
    console.error('Error closing job:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to close job' },
      { status: 500 }
    );
  }
}

