import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { z } from 'zod';

// Validation schema for publication submissions
const submissionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must be less than 300 characters'),
  author: z.string().min(1, 'Author name is required').max(200, 'Author name must be less than 200 characters'),
  authorEmail: z.string().email('Valid email is required').optional(),
  category: z.enum(['article', 'blog', 'report']),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  content: z.string().optional(),
  tags: z.string().optional(),
  submittedByName: z.string().min(1, 'Your name is required'),
  submittedByEmail: z.string().email('Valid email is required'),
  submittedByPhone: z.string().optional(),
  media: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number()
  })).optional(),
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

// GET /api/publication-submissions - Get all submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all pending submissions
    const submissions = await Publication.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        submissions
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/publication-submissions - Submit a new publication
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugCounter = 1;
    let originalSlug = slug;

    while (await Publication.findOne({ slug })) {
      slug = `${originalSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Parse tags if provided as string
    const tags = validatedData.tags 
      ? validatedData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    // Extract images from media if any
    const images = validatedData.media?.filter(m => m.type.startsWith('image/')).map(m => m.url) || [];

    // Create publication with pending status
    const publication = new Publication({
      title: validatedData.title,
      slug,
      author: validatedData.author,
      content: validatedData.content || `<p>${validatedData.description}</p>`,
      excerpt: validatedData.description,
      category: validatedData.category,
      tags,
      images,
      pdfUrl: validatedData.media?.find(m => m.type === 'application/pdf')?.url || '',
      type: 'text',
      status: 'pending',
      // Store submission metadata
      description: validatedData.description,
      // Additional fields for tracking
      seoTitle: validatedData.title.substring(0, 60),
      seoDescription: validatedData.description.substring(0, 160)
    });

    await publication.save();

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      data: publication,
      message: 'Publication submission received successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting publication:', error);
    
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
      { success: false, error: 'Failed to submit publication' },
      { status: 500 }
    );
  }
}
