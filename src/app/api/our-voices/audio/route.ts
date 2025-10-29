import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import AudioPodcast from '@/models/AudioPodcast';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  audioUrl: z.string().min(1),
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const query: any = {};
    if (!includeDrafts) query.status = 'published';
    const items = await AudioPodcast.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch audio' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const data = createSchema.parse(body);
    const item = new AudioPodcast({
      ...data,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    });
    await item.save();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create audio' }, { status: 500 });
  }
}


