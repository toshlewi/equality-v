import { NextRequest, NextResponse } from 'next/server';

// TODO: Connect to MongoDB news collection
// This is a placeholder API endpoint for news

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // TODO: Replace with actual MongoDB query
    // const query = { status: 'published' };
    // if (category) query.category = category;
    // if (featured) query.featured = featured === 'true';
    // const news = await News.find(query).sort({ createdAt: -1 }).limit(limit);
    
    const mockNews = [
      {
        id: "1",
        title: "Equality Vanguard Launches New Legal Vanguard Program",
        excerpt: "Our newest initiative brings together legal minds committed to decolonizing legal thought and advancing gender justice.",
        content: "Full article content here...",
        date: "2024-01-15",
        image: "/images/place1 (7).jpg",
        category: "Announcements",
        featured: true,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "ALKAH Book Club: February Reading List",
        excerpt: "This month we're diving into 'Decolonization and Afrofeminism' by Dr. Sylvia Tamale.",
        content: "Full article content here...",
        date: "2024-01-20",
        image: "/images/place1 (8).jpg",
        category: "Updates",
        featured: false,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        title: "Partnership with Nobel Women's Initiative",
        excerpt: "We're excited to announce our collaboration with the Nobel Women's Initiative on advancing women's rights globally.",
        content: "Full article content here...",
        date: "2024-01-25",
        image: "/images/place1 (9).jpg",
        category: "Partnerships",
        featured: true,
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Filter by category if specified
    let filteredNews = mockNews;
    if (category) {
      filteredNews = mockNews.filter(item => item.category === category);
    }
    if (featured) {
      filteredNews = filteredNews.filter(item => item.featured === (featured === 'true'));
    }

    return NextResponse.json({
      success: true,
      data: filteredNews.slice(0, limit),
      message: "News retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch news",
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
    // TODO: Create news article in MongoDB
    // TODO: Send admin notification
    // TODO: Add to Mailchimp if applicable
    
    console.log('Creating news article:', body);
    
    return NextResponse.json({
      success: true,
      message: "News article created successfully",
      data: { id: "new-news-id" }
    });

  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create news article",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
