import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { z } from 'zod';

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
  location: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    isVirtual: z.boolean().optional(),
    virtualLink: z.string().optional(),
    virtualPlatform: z.string().optional()
  }).optional(),
  category: z.enum(['workshop', 'conference', 'meeting', 'social', 'fundraiser', 'other']),
  isPublic: z.boolean().optional(),
  isFree: z.boolean().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  ticketInfo: z.object({
    accessCode: z.string().optional(),
    hasDiscounts: z.boolean().optional(),
    discountCodes: z.array(z.object({
      code: z.string(),
      amountOff: z.number().optional(),
      percentOff: z.number().optional(),
      expiresAt: z.string().or(z.date()).optional()
    })).optional()
  }).optional(),
  capacity: z.number().optional(),
  allowWaitlist: z.boolean().optional(),
  registrationDeadline: z.string().or(z.date()).optional(),
  featuredImage: z.string().optional(),
  bannerImage: z.string().optional(),
  images: z.array(z.string()).optional(),
  showInPastCarousel: z.boolean().optional(),
  pastCarouselOrder: z.number().optional(),
  tags: z.array(z.string()).optional(),
  organizer: z.object({ name: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional() }).optional(),
  registration: z.object({
    type: z.enum(['form', 'external']).optional(),
    externalLink: z.string().optional(),
    formFields: z.array(z.object({
      name: z.string(),
      label: z.string(),
      type: z.enum(['text', 'email', 'phone', 'select', 'textarea']),
      required: z.boolean().optional(),
      options: z.array(z.string()).optional()
    })).optional()
  }).optional(),
  requirements: z.array(z.string()).optional(),
  whatToBring: z.array(z.string()).optional(),
  agenda: z.array(z.object({ time: z.string(), title: z.string(), description: z.string().optional(), speaker: z.string().optional() })).optional(),
  speakers: z.array(z.object({ name: z.string(), bio: z.string().optional(), image: z.string().optional(), title: z.string().optional(), organization: z.string().optional() })).optional(),
  sponsors: z.array(z.object({ name: z.string(), logo: z.string().optional(), website: z.string().optional(), level: z.string().optional() })).optional(),
  recap: z.object({ enabled: z.boolean().optional(), type: z.enum(['gallery', 'video']).optional(), galleryImages: z.array(z.string()).optional(), videoUrl: z.string().optional(), summary: z.string().optional() }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional()
});

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const time = searchParams.get('time'); // upcoming | ongoing | past
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }
    if (time) {
      const now = new Date();
      if (time === 'upcoming') {
        query.startDate = { $gt: now };
      } else if (time === 'ongoing') {
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
      } else if (time === 'past') {
        query.endDate = { $lt: now };
      }
    } else {
      // default public to published
      const session = await getServerSession(authOptions);
      if (!session || !session.user?.role || !['admin', 'editor', 'reviewer'].includes(session.user.role)) {
        query.status = 'published';
      }
    }

    const skip = (page - 1) * limit;
    const events = await Event.find(query).sort({ startDate: 1 }).skip(skip).limit(limit).lean();
    const total = await Event.countDocuments(query);

    return NextResponse.json({ success: true, data: { events, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    if (!['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const payload = createEventSchema.parse(body);

    // Generate unique slug
    let slug = slugify(payload.title);
    let i = 1;
    const base = slug;
    while (await Event.findOne({ slug })) {
      slug = `${base}-${i++}`;
    }

    const event = await Event.create({
      ...payload,
      startDate: new Date(payload.startDate as any),
      endDate: new Date(payload.endDate as any),
      slug,
      createdBy: session.user.id
    });

    return NextResponse.json({ success: true, data: event, message: 'Event created' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten() }, { status: 400 });
    }
    console.error('Error creating event:', error);
    return NextResponse.json({ success: false, message: 'Failed to create event' }, { status: 500 });
  }
}
