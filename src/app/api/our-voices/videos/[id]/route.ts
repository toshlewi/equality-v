import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import VideoResource from '@/models/VideoResource';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  author: z.string().optional(),
  views: z.number().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  visible: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    const updates = updateSchema.parse(body);
    if (updates.publishedAt) {
      (updates as any).publishedAt = new Date(updates.publishedAt);
    }
    const item = await VideoResource.findByIdAndUpdate(params.id, updates, { new: true });
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update video' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const item = await VideoResource.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete video' }, { status: 500 });
  }
}


