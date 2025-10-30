import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  category: z.enum(['announcement', 'update', 'event', 'achievement', 'partnership', 'other']).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  author: z.any().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishSchedule: z.string().or(z.date()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional()
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const item = await News.findById(params.id).lean();
    if (!item) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const payload = updateSchema.parse(body);

    if (payload.publishSchedule) (payload as any).publishSchedule = new Date(payload.publishSchedule as any);

    const updated = await News.findByIdAndUpdate(
      params.id,
      { ...payload, updatedAt: new Date(), updatedBy: session.user.id },
      { new: true }
    );
    if (!updated) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'News updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    await News.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'News deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}


