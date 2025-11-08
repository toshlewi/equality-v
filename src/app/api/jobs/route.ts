import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Job from '@/models/Job';
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(300).optional(),
  department: z.enum(['advocacy', 'legal', 'communications', 'programs', 'operations', 'finance', 'other']),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'volunteer']),
  location: z.enum(['remote', 'hybrid', 'on-site']),
  locationDetails: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
    address: z.string().optional()
  }).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().default('USD'),
    isPublic: z.boolean().default(true)
  }).optional(),
  status: z.enum(['draft', 'open', 'closed', 'filled']).default('draft'),
  applicationDeadline: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const location = searchParams.get('location');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (department) query.department = department;
    if (location) query.location = location;
    
    // Only show public jobs for non-admin requests
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      query.isPublic = true;
      query.status = 'open';
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
    const validatedData = createJobSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    const originalSlug = slug;

    while (await Job.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create job
    const job = new Job({
      ...validatedData,
      slug,
      applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : undefined,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      createdBy: session.user.id
    });

    await job.save();

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

