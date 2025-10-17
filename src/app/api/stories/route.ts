import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';
import Media from '@/models/Media';
import { z } from 'zod';

// Validation schemas
const createStorySchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50).max(10000),
  submitterName: z.string().optional(),
  submitterEmail: z.string().email().optional(),
  submitterPhone: z.string().optional(),
  anonymous: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  consentToPublish: z.boolean().refine(val => val === true),
  contentRights: z.boolean().refine(val => val === true),
  termsAccepted: z.boolean().refine(val => val === true),
  mediaFiles: z.array(z.object({
    filename: z.string(),
    originalName: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
    url: z.string(),
    thumbnailUrl: z.string().optional(),
    mediaType: z.enum(['image', 'video', 'audio', 'pdf']),
    duration: z.number().optional(),
    dimensions: z.object({
      width: z.number().optional(),
      height: z.number().optional()
    }).optional()
  })).optional()
});

// GET /api/stories - Get published stories with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status') || 'published';
    const featured = searchParams.get('featured');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { status };
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Get stories with pagination
    const stories = await Story.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
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

    return NextResponse.json({
      success: true,
      data: {
        stories: storiesWithMedia,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create a new story submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Validate request body
    const validatedData = createStorySchema.parse(body);

    // Create story
    const story = new Story({
      ...validatedData,
      status: 'pending',
      publishedAt: null
    });

    await story.save();

    // Create media records if files are provided
    if (validatedData.mediaFiles && validatedData.mediaFiles.length > 0) {
      const mediaPromises = validatedData.mediaFiles.map(mediaData => {
        const media = new Media({
          ...mediaData,
          associatedContent: {
            type: 'story',
            contentId: story._id
          },
          uploadedBy: null, // Will be set if user is authenticated
          processingStatus: 'completed'
        });
        return media.save();
      });

      await Promise.all(mediaPromises);
    }

    // TODO: Send notification email to admin
    // TODO: Add to Mailchimp if user opted in

    return NextResponse.json({
      success: true,
      data: {
        storyId: story._id,
        message: 'Story submitted successfully. It will be reviewed before publication.'
      }
    });

  } catch (error) {
    console.error('Error creating story:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create story' },
      { status: 500 }
    );
  }
}
