import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for updating publications
const updatePublicationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(300, 'Title must not exceed 300 characters').optional(),
  author: z.string().min(1, 'Author name is required').max(200, 'Author must not exceed 200 characters').optional(),
  content: z.string().optional(),
  excerpt: z.string().max(1000, 'Excerpt must not exceed 1000 characters').optional(),
  featuredImage: z.string().optional(),
  pdfUrl: z.string().optional(),
  category: z.enum(['article', 'blog', 'report']).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().max(60, 'SEO title must not exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must not exceed 160 characters').optional(),
  isFeatured: z.boolean().optional(),
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

// GET /api/publications/[id] - Get a single publication
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
        { success: false, error: 'Invalid publication ID' },
        { status: 400 }
      );
    }

    const publication = await Publication.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!publication) {
      return NextResponse.json(
        { success: false, error: 'Publication not found' },
        { status: 404 }
      );
    }

    // Increment view count for published publications
    if (publication.status === 'published') {
      await Publication.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
      publication.viewCount += 1;
    }

    return NextResponse.json({
      success: true,
      data: publication
    });

  } catch (error) {
    console.error('Error fetching publication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch publication' },
      { status: 500 }
    );
  }
}

// PUT /api/publications/[id] - Update a publication
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

    // Check if user has permission to update publications
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
        { success: false, error: 'Invalid publication ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updatePublicationSchema.parse(body);

    // Check if publication exists
    const existingPublication = await Publication.findById(id);
    if (!existingPublication) {
      return NextResponse.json(
        { success: false, error: 'Publication not found' },
        { status: 404 }
      );
    }

    // Generate new slug if title is being updated
    let slug = existingPublication.slug;
    if (validatedData.title && validatedData.title !== existingPublication.title) {
      slug = generateSlug(validatedData.title);
      
      // Ensure slug is unique
      let slugCounter = 1;
      let originalSlug = slug;
      
      while (await Publication.findOne({ slug, _id: { $ne: id } })) {
        slug = `${originalSlug}-${slugCounter}`;
        slugCounter++;
      }
    }

    // Set publishedAt when status changes to published
    const updateData: any = {
      slug,
      updatedBy: session.user.id
    };

    // Only add validated fields that are provided
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key as keyof typeof validatedData] !== undefined) {
        updateData[key] = validatedData[key as keyof typeof validatedData];
      }
    });

    if (validatedData.status === 'published' && existingPublication.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const publication = await Publication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: publication,
      message: 'Publication updated successfully'
    });

  } catch (error) {
    console.error('Error updating publication:', error);
    
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

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update publication' },
      { status: 500 }
    );
  }
}

// DELETE /api/publications/[id] - Delete a publication
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

    // Check if user has permission to delete publications
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
        { success: false, error: 'Invalid publication ID' },
        { status: 400 }
      );
    }

    const publication = await Publication.findById(id);
    if (!publication) {
      return NextResponse.json(
        { success: false, error: 'Publication not found' },
        { status: 404 }
      );
    }

    // Soft delete by changing status to archived
    await Publication.findByIdAndUpdate(id, { 
      status: 'archived',
      updatedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Publication archived successfully'
    });

  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete publication' },
      { status: 500 }
    );
  }
}