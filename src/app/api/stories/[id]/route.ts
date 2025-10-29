import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';
import Media from '@/models/Media';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  content: z.string().min(50).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['pending', 'in_review', 'approved', 'published', 'rejected']).optional(),
  featured: z.boolean().optional(),
  reviewNotes: z.string().max(1000).optional(),
  allowComments: z.boolean().optional(),
  contentWarnings: z.array(z.string()).optional(),
  ageRestricted: z.boolean().optional(),
});

// GET /api/stories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const story = await Story.findById(params.id)
      .populate('reviewerId', 'name email')
      .lean();

    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    const mediaFiles = await Media.find({
      'associatedContent.type': 'story',
      'associatedContent.contentId': params.id
    }).lean();

    await Story.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    return NextResponse.json({ success: true, data: { ...story, mediaFiles } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch story' }, { status: 500 });
  }
}

// PUT /api/stories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const updateData: any = { ...parsed };
    if (updateData.content) {
      updateData.text = updateData.content;
      delete updateData.content;
    }
    if (updateData.status === 'published') {
      updateData.publishedAt = new Date();
    }

    const story = await Story.findByIdAndUpdate(params.id, updateData, { new: true });
    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: story });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update story' }, { status: 500 });
  }
}

// DELETE /api/stories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ success: false, error: 'Story not found' }, { status: 404 });
    }

    await Media.deleteMany({
      'associatedContent.type': 'story',
      'associatedContent.contentId': params.id
    });
    await Story.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete story' }, { status: 500 });
  }
}


