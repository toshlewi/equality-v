import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for updating books
const updateBookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must not exceed 300 characters').optional(),
  author: z.string().min(1, 'Author is required').max(200, 'Author must not exceed 200 characters').optional(),
  isbn: z.string().optional(),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  coverUrl: z.string().optional(),
  genre: z.string().optional(),
  year: z.number().optional(),
  publisher: z.string().max(100, 'Publisher must not exceed 100 characters').optional(),
  language: z.string().optional(),
  pages: z.number().optional(),
  category: z.enum(['fiction', 'non-fiction', 'poetry', 'essays', 'memoir', 'academic', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isInLibrary: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isBookClubSelection: z.boolean().optional(),
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

// GET /api/books/[id] - Get a single book
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
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = await Book.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Book.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    book.viewCount += 1;

    return NextResponse.json({
      success: true,
      data: book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] - Update a book
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

    // Check if user has permission to update books
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
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateBookSchema.parse(body);

    // Check if book exists
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Generate new slug if title is being updated
    let slug = existingBook.slug;
    if (validatedData.title && validatedData.title !== existingBook.title) {
      slug = generateSlug(validatedData.title);
      
      // Ensure slug is unique
      let slugCounter = 1;
      let originalSlug = slug;
      
      while (await Book.findOne({ slug, _id: { $ne: id } })) {
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

    // Convert bookClubDate string to Date if provided
    if (validatedData.bookClubDate) {
      updateData.bookClubDate = new Date(validatedData.bookClubDate);
    }

    const book = await Book.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book updated successfully'
    });

  } catch (error) {
    console.error('Error updating book:', error);
    
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

    const errorMessage = error instanceof Error ? error.message : 'Failed to update book';
    return NextResponse.json(
      { success: false, error: errorMessage, details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
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

    // Check if user has permission to delete books
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
        { success: false, error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    // Soft delete by changing status to archived
    await Book.findByIdAndUpdate(id, { 
      status: 'archived',
      updatedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Book archived successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}
