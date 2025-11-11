import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { z } from 'zod';
import { updateCalendarEvent, deleteCalendarEvent, createCalendarEvent, isGoogleCalendarConfigured } from '@/lib/google-calendar';

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
  showInPastCarousel: z.boolean().optional(),
  pastCarouselOrder: z.number().optional(),
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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const event = await Event.findById(id).lean();
    if (!event) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    const body = await request.json();
    const payload = updateSchema.parse(body);

    if (payload.startDate) (payload as any).startDate = new Date(payload.startDate as any);
    if (payload.endDate) (payload as any).endDate = new Date(payload.endDate as any);

    const existingEvent = await Event.findById(id);
    if (!existingEvent) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    const updated = await Event.findByIdAndUpdate(
      id,
      { ...payload, updatedAt: new Date(), updatedBy: session.user.id },
      { new: true }
    );

    // Sync with Google Calendar if configured
    if (isGoogleCalendarConfigured()) {
      try {
        const shouldSync = updated.status === 'published';
        const hadCalendarEvent = !!existingEvent.googleCalendarEventId;

        if (shouldSync) {
          const location = updated.location?.isVirtual 
            ? updated.location.virtualLink || 'Virtual Event'
            : updated.location?.address || updated.location?.name || '';

          const calendarData: any = {};
          if (payload.title) calendarData.summary = updated.title;
          if (payload.description) calendarData.description = updated.description;
          if (payload.location) calendarData.location = location;
          if (payload.startDate) calendarData.startDateTime = updated.startDate.toISOString();
          if (payload.endDate) calendarData.endDateTime = updated.endDate.toISOString();
          if (payload.timezone) calendarData.timezone = updated.timezone;

          if (hadCalendarEvent) {
            // Update existing calendar event
            const result = await updateCalendarEvent(existingEvent.googleCalendarEventId, calendarData);
            if (!result.success) {
              console.warn('Failed to update Google Calendar event:', result.error);
            }
          } else {
            // Create new calendar event
            const result = await createCalendarEvent({
              summary: updated.title,
              description: updated.description,
              location,
              startDateTime: updated.startDate.toISOString(),
              endDateTime: updated.endDate.toISOString(),
              timezone: updated.timezone || 'Africa/Nairobi'
            });
            if (result.success && result.eventId) {
              updated.googleCalendarEventId = result.eventId;
              await updated.save();
            }
          }
        } else if (hadCalendarEvent && (payload.status === 'cancelled' || payload.status === 'draft')) {
          // Delete calendar event if status changed to cancelled or draft
          await deleteCalendarEvent(existingEvent.googleCalendarEventId);
          updated.googleCalendarEventId = undefined;
          await updated.save();
        }
      } catch (calendarError) {
        console.error('Error syncing to Google Calendar:', calendarError);
      }
    }

    return NextResponse.json({ success: true, data: updated, message: 'Event updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors: error.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    if (!['admin', 'editor'].includes(session.user.role)) return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 });

    await connectDB();
    const event = await Event.findById(id);
    
    // Delete from Google Calendar if synced
    if (event?.googleCalendarEventId && isGoogleCalendarConfigured()) {
      try {
        await deleteCalendarEvent(event.googleCalendarEventId);
        console.log('Event deleted from Google Calendar');
      } catch (calendarError) {
        console.error('Error deleting from Google Calendar:', calendarError);
      }
    }
    
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 });
  }
}


