import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Book from '@/models/Book';
import { z } from 'zod';

// Validation schema for book suggestions
const bookSuggestionSchema = z.object({
  title: z.string().min(1, 'Book title is required').max(300, 'Title must be less than 300 characters'),
  author: z.string().min(1, 'Author name is required').max(200, 'Author name must be less than 200 characters'),
  year: z.number().min(1800, 'Year must be after 1800').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  category: z.enum(['fiction', 'non-fiction', 'biography', 'poetry', 'academic', 'children', 'other']),
  genre: z.string().optional(),
  summary: z.string().min(1, 'Summary is required').max(1000, 'Summary must be less than 1000 characters'),
  reason: z.string().min(1, 'Reason for recommendation is required').max(500, 'Reason must be less than 500 characters'),
  suggestedByName: z.string().min(1, 'Your name is required'),
  suggestedByEmail: z.string().email('Valid email is required'),
  suggestedByPhone: z.string().optional(),
  coverImage: z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number()
  }).optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions')
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

// GET /api/book-suggestions - Get book suggestions (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all pending book suggestions
    const suggestions = await Book.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error('Error fetching book suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book suggestions' },
      { status: 500 }
    );
  }
}

// POST /api/book-suggestions - Submit a book suggestion
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = bookSuggestionSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Book.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Map category
    const categoryMap: { [key: string]: string } = {
      'biography': 'memoir',
      'children': 'other'
    };
    const mappedCategory = categoryMap[validatedData.category] || validatedData.category;

    // Create book with pending status
    const book = new Book({
      title: validatedData.title,
      slug,
      author: validatedData.author,
      genre: validatedData.genre || mappedCategory,
      year: validatedData.year,
      coverUrl: validatedData.coverImage?.url || '',
      description: validatedData.summary,
      shortDescription: validatedData.summary.substring(0, 200),
      category: mappedCategory,
      status: 'pending',
      isInLibrary: true,
      isAvailable: false, // Not available until reviewed
      isFeatured: false,
      // Store submission metadata
      submittedByName: validatedData.suggestedByName,
      submittedByEmail: validatedData.suggestedByEmail,
      submittedByPhone: validatedData.suggestedByPhone,
      submissionDate: new Date(),
      seoTitle: validatedData.title.substring(0, 60),
      seoDescription: validatedData.summary.substring(0, 160)
    });

    await book.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      data: book,
      message: 'Book suggestion submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting book suggestion:', error);
    
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
      { success: false, error: 'Failed to submit book suggestion' },
      { status: 500 }
    );
  }
}

