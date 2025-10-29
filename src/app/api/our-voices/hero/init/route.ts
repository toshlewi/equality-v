import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import HeroItem from '@/models/HeroItem';

// Initialize 12 hero items from placeholders
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if items already exist
    const existing = await HeroItem.countDocuments();
    if (existing >= 12) {
      return NextResponse.json({ 
        success: false, 
        message: 'Hero items already initialized' 
      });
    }

    const placeholderData = [
      { title: 'Breaking the Silence: Women in Tech', backgroundImage: '/images/hero-1.png', type: 'video', duration: 180, author: 'Sarah Mwangi', views: 1250, featured: true, order: 1, visible: true, status: 'published' },
      { title: 'Feminist Art Exhibition', backgroundImage: '/images/hero-2.png', type: 'image', author: 'Anonymous', views: 890, order: 2, visible: true, status: 'published' },
      { title: 'Podcast: Economic Justice', backgroundImage: '/images/hero-3.png', type: 'audio', duration: 2400, author: 'Dr. Amina Hassan', views: 2100, order: 3, visible: true, status: 'published' },
      { title: 'My Journey to Self-Love', backgroundImage: '/images/hero-4.png', type: 'story', author: 'Anonymous', views: 1560, order: 4, visible: true, status: 'published' },
      { title: 'Digital Rights Workshop', backgroundImage: '/images/hero-5.png', type: 'video', duration: 360, author: 'Tech Team', views: 980, order: 5, visible: true, status: 'published' },
      { title: 'Community Gathering', backgroundImage: '/images/place1 (1).jpg', type: 'image', author: 'EV Community', views: 750, order: 6, visible: true, status: 'published' },
      { title: 'Book Club Discussion', backgroundImage: '/images/place1 (2).jpg', type: 'audio', duration: 1800, author: 'ALKAH Book Club', views: 1200, order: 7, visible: true, status: 'published' },
      { title: 'Overcoming Adversity', backgroundImage: '/images/place1 (3).jpg', type: 'story', author: 'Anonymous', views: 2100, order: 8, visible: true, status: 'published' },
      { title: 'Legal Rights Workshop', backgroundImage: '/images/place1 (4).jpg', type: 'video', duration: 420, author: 'Legal Vanguard', views: 890, order: 9, visible: true, status: 'published' },
      { title: 'Voices of Resistance', backgroundImage: '/images/place1 (5).jpg', type: 'audio', duration: 1800, author: 'Community Voices', views: 4200, order: 10, visible: true, status: 'published' },
      { title: 'Art for Change Exhibition', backgroundImage: '/images/place1 (6).jpg', type: 'image', author: 'Creative Collective', views: 5800, order: 11, visible: true, status: 'published' },
      { title: 'From Struggle to Strength', backgroundImage: '/images/place1 (7).jpg', type: 'story', author: 'Anonymous', views: 11200, order: 12, visible: true, status: 'published' },
    ];

    // Delete existing and create new
    await HeroItem.deleteMany({});
    const items = await HeroItem.insertMany(placeholderData);

    return NextResponse.json({ 
      success: true, 
      message: 'Hero items initialized',
      count: items.length
    });
  } catch (error) {
    console.error('Error initializing hero items:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to initialize hero items' 
    }, { status: 500 });
  }
}

