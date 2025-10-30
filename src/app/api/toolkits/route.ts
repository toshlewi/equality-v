import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Toolkit from '@/models/Toolkit';
import { z } from 'zod';

// Validation schema for creating toolkits
const createToolkitSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters'),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  category: z.enum(['legal', 'advocacy', 'education', 'community', 'research', 'other']),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featuredImage: z
    .string()
    .regex(/^\/(uploads|images)\//, 'Featured image must be an uploaded file path')
    .or(z.string().url())
    .optional(),
  files: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.enum(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']),
    size: z.number(),
    description: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).optional(),
  isFeatured: z.boolean().optional(),
  isPublic: z.boolean().default(true),
  accessLevel: z.enum(['public', 'member', 'admin']).default('public'),
  targetAudience: z.array(z.string()).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  estimatedTime: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must not exceed 160 characters').optional(),
  thumbnailImage: z
    .string()
    .regex(/^\/(uploads|images)\//, 'Thumbnail image must be an uploaded file path')
    .or(z.string().url())
    .optional()
});

// Helper function to generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET /api/toolkits - List toolkits with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const accessLevel = searchParams.get('accessLevel');
    const difficultyLevel = searchParams.get('difficultyLevel');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status };
    
    if (category) query.category = category;
    if (accessLevel) query.accessLevel = accessLevel;
    if (difficultyLevel) query.difficultyLevel = difficultyLevel;
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get toolkits with pagination
    const toolkits = await Toolkit.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Toolkit.countDocuments(query);

    // Get featured toolkits if requested
    let featuredToolkits = [];
    if (featured === 'true' && page === 1) {
      featuredToolkits = await Toolkit.find({ 
        isFeatured: true, 
        status: 'published' 
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name email')
      .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        toolkits,
        featuredToolkits,
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
    console.error('Error fetching toolkits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch toolkits' },
      { status: 500 }
    );
  }
}

// POST /api/toolkits - Create a new toolkit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create toolkits
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createToolkitSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Toolkit.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Create toolkit
    const toolkit = new Toolkit({
      ...validatedData,
      slug,
      createdBy: session.user.id,
      status: 'draft' // Start as draft, admin can publish
    });

    await toolkit.save();

    // Populate the created toolkit
    await toolkit.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: toolkit,
      message: 'Toolkit created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating toolkit:', error);
    
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
      { success: false, error: 'Failed to create toolkit' },
      { status: 500 }
    );
  }
}