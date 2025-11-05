import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Partnership from '@/models/Partnership';
import { z } from 'zod';

// Validation schema for creating partnerships
const createPartnershipSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters'),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  organizationType: z.enum(['ngo', 'government', 'academic', 'private', 'international', 'other']),
  focusAreas: z.array(z.enum(['gender-justice', 'legal-advocacy', 'education', 'health', 'economic-empowerment', 'digital-rights', 'climate-justice', 'other'])).optional(),
  geographicScope: z.enum(['local', 'national', 'regional', 'continental', 'global']),
  countries: z.array(z.string()).optional(),
  partnershipType: z.enum(['strategic', 'programmatic', 'funding', 'technical', 'advocacy', 'research', 'other']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  primaryContact: z.object({
    name: z.string().min(2, 'Contact name must be at least 2 characters'),
    title: z.string().optional(),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional()
  }),
  socialMedia: z.object({
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional()
  }).optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().optional(),
  seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must not exceed 160 characters').optional()
});

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// GET /api/partnerships - List partnerships with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';
    const organizationType = searchParams.get('organizationType');
    const partnershipType = searchParams.get('partnershipType');
    const geographicScope = searchParams.get('geographicScope');
    const focusArea = searchParams.get('focusArea');
    const country = searchParams.get('country');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status };
    
    if (organizationType) query.organizationType = organizationType;
    if (partnershipType) query.partnershipType = partnershipType;
    if (geographicScope) query.geographicScope = geographicScope;
    if (focusArea) query.focusAreas = { $in: [focusArea] };
    if (country) query.countries = { $in: [country] };
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get partnerships with pagination
    const partnerships = await Partnership.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Partnership.countDocuments(query);

    // Get featured partnerships if requested
    let featuredPartnerships = [];
    if (featured === 'true' && page === 1) {
      featuredPartnerships = await Partnership.find({ 
        isFeatured: true, 
        status: 'active',
        isPublic: true
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name email')
      .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        partnerships,
        featuredPartnerships,
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
    console.error('Error fetching partnerships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnerships' },
      { status: 500 }
    );
  }
}

// POST /api/partnerships - Create a new partnership
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create partnerships
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createPartnershipSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.name);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Partnership.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Convert date strings to Date objects
    const partnershipData = {
      ...validatedData,
      slug,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
      createdBy: session.user.id,
      status: 'pending' // Start as pending, admin can activate
    };

    // Create partnership
    const partnership = new Partnership(partnershipData);
    await partnership.save();

    // Populate the created partnership
    await partnership.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: partnership,
      message: 'Partnership created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating partnership:', error);
    
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
      { success: false, error: 'Failed to create partnership' },
      { status: 500 }
    );
  }
}
