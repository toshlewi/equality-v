import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Partnership from '@/models/Partnership';
import { z } from 'zod';
import mongoose from 'mongoose';

// Validation schema for updating partnerships
const updatePartnershipSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name must not exceed 200 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must not exceed 2000 characters').optional(),
  shortDescription: z.string().max(300, 'Short description must not exceed 300 characters').optional(),
  logo: z.string().url().optional(),
  website: z.string().url().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  organizationType: z.enum(['ngo', 'government', 'academic', 'private', 'international', 'other']).optional(),
  focusAreas: z.array(z.enum(['gender-justice', 'legal-advocacy', 'education', 'health', 'economic-empowerment', 'digital-rights', 'climate-justice', 'other'])).optional(),
  geographicScope: z.enum(['local', 'national', 'regional', 'continental', 'global']).optional(),
  countries: z.array(z.string()).optional(),
  partnershipType: z.enum(['strategic', 'programmatic', 'funding', 'technical', 'advocacy', 'research', 'other']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  primaryContact: z.object({
    name: z.string().min(2, 'Contact name must be at least 2 characters'),
    title: z.string().optional(),
    email: z.string().email('Invalid email format'),
    phone: z.string().optional()
  }).optional(),
  socialMedia: z.object({
    twitter: z.string().url().optional(),
    facebook: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional()
  }).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'expired', 'terminated']).optional(),
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

// GET /api/partnerships/[id] - Get a single partnership
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
        { success: false, error: 'Invalid partnership ID' },
        { status: 400 }
      );
    }

    const partnership = await Partnership.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partnership
    });

  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnership' },
      { status: 500 }
    );
  }
}

// PUT /api/partnerships/[id] - Update a partnership
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

    // Check if user has permission to update partnerships
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
        { success: false, error: 'Invalid partnership ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updatePartnershipSchema.parse(body);

    // Check if partnership exists
    const existingPartnership = await Partnership.findById(id);
    if (!existingPartnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Generate new slug if name is being updated
    let slug = existingPartnership.slug;
    if (validatedData.name && validatedData.name !== existingPartnership.name) {
      slug = generateSlug(validatedData.name);
      
      // Ensure slug is unique
      let slugCounter = 1;
      let originalSlug = slug;
      
      while (await Partnership.findOne({ slug, _id: { $ne: id } })) {
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
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      updateData.endDate = new Date(validatedData.endDate);
    }

    const partnership = await Partnership.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: partnership,
      message: 'Partnership updated successfully'
    });

  } catch (error) {
    console.error('Error updating partnership:', error);
    
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
      { success: false, error: 'Failed to update partnership' },
      { status: 500 }
    );
  }
}

// DELETE /api/partnerships/[id] - Delete a partnership
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

    // Check if user has permission to delete partnerships
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
        { success: false, error: 'Invalid partnership ID' },
        { status: 400 }
      );
    }

    const partnership = await Partnership.findById(id);
    if (!partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Soft delete by changing status to terminated
    await Partnership.findByIdAndUpdate(id, { 
      status: 'terminated',
      updatedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      message: 'Partnership terminated successfully'
    });

  } catch (error) {
    console.error('Error deleting partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partnership' },
      { status: 500 }
    );
  }
}
