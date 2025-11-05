import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import BookMeeting from '@/models/BookMeeting';
import Book from '@/models/Book';
import { z } from 'zod';

// Validation schema for creating book meetings
const createBookMeetingSchema = z.object({
  book: z.string().min(1, 'Book ID is required'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters'),
  meetingDate: z.string().datetime('Invalid meeting date format'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  timezone: z.string().default('UTC'),
  location: z.object({
    name: z.string().min(2, 'Location name must be at least 2 characters'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }).optional(),
    isVirtual: z.boolean().default(false),
    virtualLink: z.string().url().optional(),
    virtualPlatform: z.string().optional()
  }),
  isPublic: z.boolean().default(true),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  allowWaitlist: z.boolean().default(true),
  registrationDeadline: z.string().datetime().optional(),
  featuredImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  discussionQuestions: z.array(z.string()).optional(),
  keyThemes: z.array(z.string()).optional(),
  facilitator: z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    image: z.string().url().optional()
  }).optional()
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

// GET /api/book-meetings - List book meetings with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const bookId = searchParams.get('bookId');
    const status = searchParams.get('status') || 'scheduled';
    const isPublic = searchParams.get('isPublic');
    const city = searchParams.get('city');
    const isVirtual = searchParams.get('isVirtual');
    const upcoming = searchParams.get('upcoming');
    const sortBy = searchParams.get('sortBy') || 'meetingDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (bookId) query.book = bookId;
    if (status) query.status = status;
    if (isPublic !== null) query.isPublic = isPublic === 'true';
    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (isVirtual !== null) query['location.isVirtual'] = isVirtual === 'true';
    
    if (upcoming === 'true') {
      query.meetingDate = { $gte: new Date() };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get book meetings with pagination
    const bookMeetings = await BookMeeting.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('book', 'title author coverImage')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    // Get total count for pagination
    const total = await BookMeeting.countDocuments(query);

    // Get upcoming meetings if requested
    let upcomingMeetings = [];
    if (upcoming === 'true' && page === 1) {
      upcomingMeetings = await BookMeeting.find({ 
        meetingDate: { $gte: new Date() },
        status: 'scheduled',
        isPublic: true
      })
      .sort({ meetingDate: 1 })
      .limit(6)
      .populate('book', 'title author coverImage')
      .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        bookMeetings,
        upcomingMeetings,
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
    console.error('Error fetching book meetings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book meetings' },
      { status: 500 }
    );
  }
}

// POST /api/book-meetings - Create a new book meeting
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to create book meetings
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const validatedData = createBookMeetingSchema.parse(body);

    // Verify book exists
    const book = await Book.findById(validatedData.book);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await BookMeeting.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Convert date strings to Date objects
    const meetingData = {
      ...validatedData,
      slug,
      meetingDate: new Date(validatedData.meetingDate),
      registrationDeadline: validatedData.registrationDeadline ? new Date(validatedData.registrationDeadline) : undefined,
      createdBy: session.user.id,
      status: 'scheduled'
    };

    // Create book meeting
    const bookMeeting = new BookMeeting(meetingData);
    await bookMeeting.save();

    // Populate the created book meeting
    await bookMeeting.populate('book', 'title author coverImage');
    await bookMeeting.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: bookMeeting,
      message: 'Book meeting created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating book meeting:', error);
    
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
      { success: false, error: 'Failed to create book meeting' },
      { status: 500 }
    );
  }
}
