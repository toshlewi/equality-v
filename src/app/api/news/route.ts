import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.enum(['announcement', 'update', 'event', 'achievement', 'partnership', 'other']),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  author: z.object({ name: z.string().min(1), bio: z.string().optional(), image: z.string().optional(), socialLinks: z.object({ twitter: z.string().optional(), linkedin: z.string().optional(), website: z.string().optional() }).optional() }),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishSchedule: z.string().or(z.date()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional()
});

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const q = searchParams.get('q');

    const query: any = {};
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (q) query.$or = [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }];

    if (status) {
      query.status = status;
    } else {
      const session = await getServerSession(authOptions);
      if (!session || !['admin', 'editor', 'reviewer'].includes(session.user?.role)) query.status = 'published';
    }

    const skip = (page - 1) * limit;
    const news = await News.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await News.countDocuments(query);

    return NextResponse.json({ success: true, data: { news, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const payload = createSchema.parse(body);

    let slug = slugify(payload.title);
    let i = 1;
    const base = slug;
    while (await News.findOne({ slug })) slug = `${base}-${i++}`;

    const news = await News.create({
      ...payload,
      slug,
      publishSchedule: payload.publishSchedule ? new Date(payload.publishSchedule as any) : undefined,
      createdBy: session.user.id
    });

    return NextResponse.json({ success: true, data: news, message: 'News created' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten() }, { status: 400 });
    }
    console.error('Error creating news:', error);
    return NextResponse.json({ success: false, message: 'Failed to create news' }, { status: 500 });
  }
}
