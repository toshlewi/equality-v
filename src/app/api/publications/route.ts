import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { z } from 'zod';

// Validation schema for creating publications
const createPublicationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must not exceed 300 characters'),
  author: z.string().min(1, 'Author is required').max(200, 'Author must not exceed 200 characters'),
  content: z.string().optional(),
  excerpt: z.string().max(1000, 'Excerpt must not exceed 1000 characters').optional(),
  featuredImage: z.string().optional(),
  pdfUrl: z.string().optional(),
  category: z.enum(['article', 'blog', 'report']).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must not exceed 160 characters').optional(),
  isFeatured: z.boolean().optional()
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

// GET /api/publications - List publications with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // Don't default to 'published' for admin
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const author = searchParams.get('author');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    // Only filter by status if specified (for admin) or default to 'published' for public
    if (status) {
      query.status = status;
    } else {
      // Public access defaults to published only
      const session = await getServerSession(authOptions);
      if (!session || !['admin', 'editor', 'reviewer'].includes(session.user?.role)) {
        query.status = 'published';
      }
      // If authenticated admin, query all statuses
    }
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (featured === 'true') query.isFeatured = true;
    if (author) query.author = { $regex: author, $options: 'i' };
    
    if (search) {
      // Use regex for case-insensitive search across multiple fields
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get publications with pagination
    const publications = await Publication.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Publication.countDocuments(query);

    // Get featured publications if requested
    let featuredPublications = [];
    if (featured === 'true' && page === 1) {
      featuredPublications = await Publication.find({ 
        isFeatured: true, 
        status: 'published' 
      })
      .sort({ publishedAt: -1 })
      .limit(3)
      .populate('createdBy', 'name email')
      .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        publications,
        featuredPublications,
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
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publications' },
      { status: 500 }
    );
  }
}

// POST /api/publications - Create a new publication
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create publications
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createPublicationSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Publication.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Ensure required fields exist (required by model)
    const publicationData: any = {
      title: validatedData.title,
      author: validatedData.author,
      content: validatedData.content || '<p>Content coming soon...</p>',
      excerpt: validatedData.excerpt || '',
      category: validatedData.category || 'article',
      slug,
      status: 'pending',
      createdBy: session.user.id
    };

    // Add optional fields
    if (validatedData.featuredImage) publicationData.featuredImage = validatedData.featuredImage;
    if (validatedData.pdfUrl) publicationData.pdfUrl = validatedData.pdfUrl;
    if (validatedData.tags) publicationData.tags = validatedData.tags;
    if (validatedData.seoTitle) publicationData.seoTitle = validatedData.seoTitle;
    if (validatedData.seoDescription) publicationData.seoDescription = validatedData.seoDescription;
    if (validatedData.isFeatured !== undefined) publicationData.isFeatured = validatedData.isFeatured;

    // Create publication
    const publication = new Publication(publicationData);

    await publication.save();

    // Populate the created publication
    await publication.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: publication,
      message: 'Publication created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating publication:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create publication';
    return NextResponse.json(
      { success: false, error: errorMessage, details: errorMessage },
      { status: 500 }
    );
  }
}