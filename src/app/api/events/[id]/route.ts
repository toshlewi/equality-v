import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
  location: z.any().optional(),
  category: z.enum(['workshop', 'conference', 'meeting', 'social', 'fundraiser', 'other']).optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  isPublic: z.boolean().optional(),
  isFree: z.boolean().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  ticketInfo: z.any().optional(),
  capacity: z.number().optional(),
  allowWaitlist: z.boolean().optional(),
  registrationDeadline: z.string().or(z.date()).optional(),
  featuredImage: z.string().optional(),
  bannerImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  organizer: z.any().optional(),
  registration: z.any().optional(),
  requirements: z.array(z.string()).optional(),
  whatToBring: z.array(z.string()).optional(),
  agenda: z.any().optional(),
  speakers: z.any().optional(),
  sponsors: z.any().optional(),
  recap: z.any().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional()
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const event = await Event.findById(params.id).lean();
    if (!event) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch event' }, { status: 500 });
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

    if (payload.startDate) (payload as any).startDate = new Date(payload.startDate as any);
    if (payload.endDate) (payload as any).endDate = new Date(payload.endDate as any);

    const updated = await Event.findByIdAndUpdate(
      params.id,
      { ...payload, updatedAt: new Date(), updatedBy: session.user.id },
      { new: true }
    );
    if (!updated) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated, message: 'Event updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    await Event.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 });
  }
}


