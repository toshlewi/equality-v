import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { z } from 'zod';

// Validation schema for creating books
const createBookSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must not exceed 200 characters'),
  author: z.string().min(2, 'Author must be at least 2 characters').max(100, 'Author must not exceed 100 characters'),
  isbn: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must not exceed 1000 characters'),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  coverImage: z.string().url().optional(),
  year: z.number().min(1000, 'Year must be valid').max(new Date().getFullYear() + 1, 'Year cannot be in the future').optional(),
  publisher: z.string().max(100, 'Publisher must not exceed 100 characters').optional(),
  language: z.string().default('English'),
  pages: z.number().min(1, 'Pages must be at least 1').optional(),
  category: z.enum(['fiction', 'non-fiction', 'poetry', 'essays', 'memoir', 'academic', 'other']).default('non-fiction'),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isInLibrary: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isBookClubSelection: z.boolean().optional(),
  bookClubDate: z.string().datetime().optional(),
  discussionNotes: z.string().max(2000, 'Discussion notes must not exceed 2000 characters').optional(),
  seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must not exceed 160 characters').optional()
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

// GET /api/books - List books with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const bookClub = searchParams.get('bookClub');
    const available = searchParams.get('available');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status: 'active' };
    
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (bookClub === 'true') query.isBookClubSelection = true;
    if (available === 'true') query.isAvailable = true;
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get books with pagination
    const books = await Book.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Book.countDocuments(query);

    // Get featured books if requested
    let featuredBooks = [];
    if (featured === 'true' && page === 1) {
      featuredBooks = await Book.find({ 
        isFeatured: true, 
        status: 'active' 
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name email')
      .lean();
    }

    // Get book club selections if requested
    let bookClubSelections = [];
    if (bookClub === 'true' && page === 1) {
      bookClubSelections = await Book.find({ 
        isBookClubSelection: true, 
        status: 'active' 
      })
      .sort({ bookClubDate: -1 })
      .limit(6)
      .populate('createdBy', 'name email')
      .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        books,
        featuredBooks,
        bookClubSelections,
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
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create books
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createBookSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Book.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Convert bookClubDate string to Date if provided
    const bookData = {
      ...validatedData,
      slug,
      createdBy: session.user.id,
      status: 'active'
    };

    if (validatedData.bookClubDate) {
      bookData.bookClubDate = new Date(validatedData.bookClubDate);
    }

    // Create book
    const book = new Book(bookData);
    await book.save();

    // Populate the created book
    await book.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating book:', error);
    
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
      { success: false, error: 'Failed to create book' },
      { status: 500 }
    );
  }
}