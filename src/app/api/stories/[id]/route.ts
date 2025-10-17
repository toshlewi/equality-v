import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';
import Media from '@/models/Media';

// GET /api/stories/[id] - Get a specific story by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const story = await Story.findById(params.id)
      .populate('reviewerId', 'name email')
      .lean();

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Get associated media files
    const mediaFiles = await Media.find({
      'associatedContent.type': 'story',
      'associatedContent.contentId': params.id
    }).lean();

    // Increment view count
    await Story.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    return NextResponse.json({
      success: true,
      data: {
        ...story,
        mediaFiles
      }
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

// PUT /api/stories/[id] - Update a story (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const user = await getCurrentUser(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { status, reviewNotes, featured, contentWarnings, ageRestricted } = body;

    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (reviewNotes) updateData.reviewNotes = reviewNotes;
    if (featured !== undefined) updateData.featured = featured;
    if (contentWarnings) updateData.contentWarnings = contentWarnings;
    if (ageRestricted !== undefined) updateData.ageRestricted = ageRestricted;

    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const story = await Story.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    );

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: story
    });

  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id] - Delete a story (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const user = await getCurrentUser(request);
    // if (!user || !user.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const story = await Story.findById(params.id);
    
    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Delete associated media files
    await Media.deleteMany({
      'associatedContent.type': 'story',
      'associatedContent.contentId': params.id
    });

    // Delete the story
    await Story.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
