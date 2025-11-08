import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroItem from '@/models/HeroItem';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  text: z.string().max(500).optional(),
  backgroundImage: z.string().optional(),
  type: z.enum(['video', 'image', 'audio', 'story']).optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  author: z.string().optional(),
  views: z.number().optional(),
  featured: z.boolean().optional(),
  visible: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const updates = updateSchema.parse(body);
    const item = await HeroItem.findByIdAndUpdate(id, updates, { new: true });
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update hero item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const item = await HeroItem.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete hero item' }, { status: 500 });
  }
}


