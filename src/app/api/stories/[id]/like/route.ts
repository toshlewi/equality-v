import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';

// POST /api/stories/[id]/like - Like/unlike a story
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { action } = body; // 'like' or 'unlike'

    if (!action || !['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "like" or "unlike"' },
        { status: 400 }
      );
    }

    const story = await Story.findById(id);
    
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Update like count
    const increment = action === 'like' ? 1 : -1;
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { $inc: { likeCount: increment } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        likeCount: updatedStory.likeCount
      }
    });

  } catch (error) {
    console.error('Error updating story like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update story like' },
      { status: 500 }
    );
  }
}
