import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';
import Media from '@/models/Media';
import { z } from 'zod';

// Validation schema for story updates
const updateStorySchema = z.object({
  status: z.enum(['pending', 'in_review', 'approved', 'published', 'rejected']).optional(),
  reviewNotes: z.string().max(1000).optional(),
  featured: z.boolean().optional(),
  contentWarnings: z.array(z.string()).optional(),
  ageRestricted: z.boolean().optional(),
  allowComments: z.boolean().optional()
});

// GET /api/admin/stories - Get all stories for admin review
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { submitterName: { $regex: search, $options: 'i' } },
        { submitterEmail: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get stories with pagination
    const stories = await Story.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('reviewerId', 'name email')
      .lean();

    // Get total count for pagination
    const total = await Story.countDocuments(query);

    // Get media files for each story
    const storiesWithMedia = await Promise.all(
      stories.map(async (story) => {
        const mediaFiles = await Media.find({
          'associatedContent.type': 'story',
          'associatedContent.contentId': story._id
        }).lean();

        return {
          ...story,
          mediaFiles
        };
      })
    );

    // Get statistics
    const stats = await Story.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        stories: storiesWithMedia,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: {
          total: total,
          ...statusCounts
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/stories - Bulk update stories
export async function PATCH(request: NextRequest) {
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
    const { storyIds, updates } = body;

    if (!storyIds || !Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Story IDs are required' },
        { status: 400 }
      );
    }

    // Validate updates
    const validatedUpdates = updateStorySchema.parse(updates);

    // Add reviewer information
    const updateData = {
      ...validatedUpdates,
      reviewerId: null, // TODO: Get from authenticated user
      reviewedAt: new Date()
    };

    // Update stories
    const result = await Story.updateMany(
      { _id: { $in: storyIds } },
      updateData
    );

    return NextResponse.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: `${result.modifiedCount} stories updated successfully`
      }
    });

  } catch (error) {
    console.error('Error bulk updating stories:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update stories' },
      { status: 500 }
    );
  }
}
