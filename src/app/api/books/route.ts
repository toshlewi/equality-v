import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { z } from 'zod';

// Validation schema for creating books
const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must not exceed 300 characters'),
  author: z.string().min(1, 'Author is required').max(200, 'Author must not exceed 200 characters'),
  genre: z.string().optional(),
  year: z.number().optional(),
  category: z.enum(['fiction', 'non-fiction', 'poetry', 'essays', 'memoir', 'academic', 'other']).optional(),
  coverUrl: z.string().optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  isbn: z.string().optional(),
  publisher: z.string().max(100, 'Publisher must not exceed 100 characters').optional(),
  language: z.string().default('English'),
  pages: z.number().min(1, 'Pages must be at least 1').optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isInLibrary: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  isBookClubSelection: z.boolean().optional(),
  bookClubDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'review', 'published', 'rejected']).optional()
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
    const status = searchParams.get('status');
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
    const query: any = {};
    
    // Only filter by status if specified (for admin) or default to 'published' for public
    if (status) {
      query.status = status;
    } else {
      // Public access defaults to published only
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.role || !['admin', 'editor', 'reviewer'].includes(session.user.role)) {
        query.status = 'published';
      }
      // If authenticated admin, query all statuses
    }
    
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (featured === 'true') query.isFeatured = true;
    if (bookClub === 'true') query.isBookClubSelection = true;
    if (available === 'true') query.isAvailable = true;
    
    if (search) {
      // Use regex for case-insensitive search across multiple fields
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
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
    let featuredBooks: any[] = [];
    if (featured === 'true' && page === 1) {
      featuredBooks = await Book.find({ 
        isFeatured: true, 
        status: 'published' 
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name email')
      .lean();
    }

    // Get book club selections if requested
    let bookClubSelections: any[] = [];
    if (bookClub === 'true' && page === 1) {
      bookClubSelections = await Book.find({ 
        isBookClubSelection: true, 
        status: 'published' 
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
    const originalSlug = slug;

    while (await Book.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Convert bookClubDate string to Date if provided
    const bookData: any = {
      title: validatedData.title,
      author: validatedData.author,
      slug,
      status: validatedData.status || 'pending',
      createdBy: session.user.id,
      category: validatedData.category || 'non-fiction',
      language: validatedData.language || 'English',
      isInLibrary: validatedData.isInLibrary !== undefined ? validatedData.isInLibrary : true,
      isAvailable: validatedData.isAvailable !== undefined ? validatedData.isAvailable : true
    };

    // Add optional fields
    if (validatedData.coverUrl) bookData.coverUrl = validatedData.coverUrl;
    if (validatedData.genre) bookData.genre = validatedData.genre;
    if (validatedData.year) bookData.year = validatedData.year;
    if (validatedData.description) bookData.description = validatedData.description;
    if (validatedData.shortDescription) bookData.shortDescription = validatedData.shortDescription;
    if (validatedData.isbn) bookData.isbn = validatedData.isbn;
    if (validatedData.publisher) bookData.publisher = validatedData.publisher;
    if (validatedData.pages) bookData.pages = validatedData.pages;
    if (validatedData.tags) bookData.tags = validatedData.tags;
    if (validatedData.isFeatured !== undefined) bookData.isFeatured = validatedData.isFeatured;
    if (validatedData.isBookClubSelection !== undefined) bookData.isBookClubSelection = validatedData.isBookClubSelection;

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
      console.error('Validation errors:', error.issues);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.issues.map(e => `${e.path.join('.')}: ${e.message}`) 
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to create book';
    return NextResponse.json(
      { success: false, error: errorMessage, details: errorMessage },
      { status: 500 }
    );
  }
}