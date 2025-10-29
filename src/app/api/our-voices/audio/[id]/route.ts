import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AudioPodcast from '@/models/AudioPodcast';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  audioUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  duration: z.number().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  category: z.string().optional(),
  episode: z.number().optional(),
  season: z.number().optional(),
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
    const item = await AudioPodcast.findByIdAndUpdate(params.id, updates, { new: true });
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update audio' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const item = await AudioPodcast.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete audio' }, { status: 500 });
  }
}


