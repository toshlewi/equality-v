import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import BookMeeting from '@/models/BookMeeting';
import Book from '@/models/Book';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for updating book meetings
const updateBookMeetingSchema = z.object({
  book: z.string().min(1, 'Book ID is required').optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must not exceed 200 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters').optional(),
  meetingDate: z.string().datetime('Invalid meeting date format').optional(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  timezone: z.string().optional(),
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
  }).optional(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
  isPublic: z.boolean().optional(),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  allowWaitlist: z.boolean().optional(),
  registrationDeadline: z.string().datetime().optional(),
  featuredImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  discussionQuestions: z.array(z.string()).optional(),
  keyThemes: z.array(z.string()).optional(),
  facilitator: z.object({
    name: z.string().optional(),
    bio: z.string().optional(),
    image: z.string().url().optional()
  }).optional(),
  meetingNotes: z.string().max(5000, 'Meeting notes must not exceed 5000 characters').optional(),
  keyTakeaways: z.array(z.string()).optional(),
  participantFeedback: z.array(z.string()).optional()
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

// GET /api/book-meetings/[id] - Get a single book meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book meeting ID' },
        { status: 400 }
      );
    }

    const bookMeeting = await BookMeeting.findById(id)
      .populate('book', 'title author coverImage description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!bookMeeting) {
      return NextResponse.json(
        { success: false, error: 'Book meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bookMeeting
    });

  } catch (error) {
    console.error('Error fetching book meeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book meeting' },
      { status: 500 }
    );
  }
}

// PUT /api/book-meetings/[id] - Update a book meeting
export async function PUT(
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

    // Check if user has permission to update book meetings
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book meeting ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateBookMeetingSchema.parse(body);

    // Check if book meeting exists
    const existingBookMeeting = await BookMeeting.findById(id);
    if (!existingBookMeeting) {
      return NextResponse.json(
        { success: false, error: 'Book meeting not found' },
        { status: 404 }
      );
    }

    // Verify book exists if book is being updated
    if (validatedData.book) {
      const book = await Book.findById(validatedData.book);
      if (!book) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }
    }

    // Generate new slug if title is being updated
    let slug = existingBookMeeting.slug;
    if (validatedData.title && validatedData.title !== existingBookMeeting.title) {
      slug = generateSlug(validatedData.title);
      
      // Ensure slug is unique
      let slugCounter = 1;
      const originalSlug = slug;
      
      while (await BookMeeting.findOne({ slug, _id: { $ne: id } })) {
        slug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
      slug,
      updatedBy: session.user.id
    };

    // Convert date strings to Date objects if provided
    if (validatedData.meetingDate) {
      updateData.meetingDate = new Date(validatedData.meetingDate);
    }
    if (validatedData.registrationDeadline) {
      updateData.registrationDeadline = new Date(validatedData.registrationDeadline);
    }

    const bookMeeting = await BookMeeting.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('book', 'title author coverImage')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: bookMeeting,
      message: 'Book meeting updated successfully'
    });

  } catch (error) {
    console.error('Error updating book meeting:', error);
    
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
      { success: false, error: 'Failed to update book meeting' },
      { status: 500 }
    );
  }
}

// DELETE /api/book-meetings/[id] - Delete a book meeting
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

    // Check if user has permission to delete book meetings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid book meeting ID' },
        { status: 400 }
      );
    }

    const bookMeeting = await BookMeeting.findById(id);
    if (!bookMeeting) {
      return NextResponse.json(
        { success: false, error: 'Book meeting not found' },
        { status: 404 }
      );
    }

    // Check if meeting has registrations
    // Note: You might want to add a check here to prevent deletion of meetings with registrations
    // For now, we'll allow deletion but you can add this check:
    // const registrations = await EventRegistration.find({ eventId: id });
    // if (registrations.length > 0) {
    //   return NextResponse.json(
    //     { success: false, error: 'Cannot delete meeting with existing registrations' },
    //     { status: 400 }
    //   );
    // }

    await BookMeeting.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Book meeting deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book meeting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book meeting' },
      { status: 500 }
    );
  }
}
