import { NextRequest, NextResponse } from 'next/server';

// TODO: Connect to MongoDB events collection
// This is a placeholder API endpoint for events

export async function GET() {
  try {
    // TODO: Replace with actual MongoDB query
    // const events = await Event.find({ status: 'published' }).sort({ date: 1 });
    
    const mockEvents = [
      {
        id: "1",
        title: "Feminist Legal Theory Workshop",
        date: "2024-02-15",
        time: "10:00 AM - 4:00 PM",
        location: "Nairobi, Kenya",
        price: 2500,
        image: "/images/place1 (1).jpg",
        category: "Workshops",
        description: "Join us for an intensive workshop on feminist legal theory and its practical applications in contemporary legal practice.",
        instructor: "Dr. Sylvia Tamale",
        featured: true,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Digital Rights & Privacy Discussion",
        date: "2024-02-20",
        time: "6:00 PM - 8:00 PM",
        location: "Online",
        price: null,
        image: "/images/place1 (2).jpg",
        category: "Talks",
        description: "A panel discussion on digital rights, privacy, and how they intersect with gender justice in the digital age.",
        instructor: "Tech Team",
        featured: false,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockEvents,
      message: "Events retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch events",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Validate request body with Zod schema
    // TODO: Create event in MongoDB
    // TODO: Send admin notification
    // TODO: Add to Mailchimp if applicable
    
    console.log('Creating event:', body);
    
    return NextResponse.json({
      success: true,
      message: "Event created successfully",
      data: { id: "new-event-id" }
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create event",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
