import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroItem from '@/models/HeroItem';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  text: z.string().max(500).optional(),
  backgroundImage: z.string().min(1),
  type: z.enum(['video', 'image', 'audio', 'story']).optional(),
  duration: z.number().optional(),
  author: z.string().optional(),
  views: z.number().optional(),
  featured: z.boolean().optional(),
  visible: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  order: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';
    const query: any = {};
    if (!includeDrafts) query.status = 'published';
    const items = await HeroItem.find(query).sort({ order: 1, createdAt: -1 }).limit(12).lean();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch hero items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const data = createSchema.parse(body);

    const count = await HeroItem.countDocuments({});
    if (count >= 12) {
      return NextResponse.json({ success: false, error: 'Maximum of 12 hero items allowed' }, { status: 400 });
    }

    const item = new HeroItem(data);
    await item.save();
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create hero item' }, { status: 500 });
  }
}


