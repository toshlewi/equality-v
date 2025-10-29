import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Story from '@/models/Story';
import Media from '@/models/Media';
import { z } from 'zod';

// Helper to convert empty strings to undefined
const emptyStringToUndefined = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
}, z.string().optional());

// Validation schemas
const createStorySchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(50).max(10000),
  submitterName: emptyStringToUndefined,
  submitterEmail: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() === '') return undefined;
    return val;
  }, z.string().email().optional()),
  submitterPhone: emptyStringToUndefined,
  anonymous: z.boolean().default(false),
  tags: z.array(z.string()).optional().default([]),
  consentToPublish: z.boolean().refine(val => val === true, "You must consent to publish"),
  contentRights: z.boolean().refine(val => val === true, "You must confirm content rights"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept terms"),
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
  })).optional().default([])
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

    // Create story - map content to text, and mediaFiles to files
    const storyData: any = {
      title: validatedData.title,
      text: validatedData.content, // Map content to text
      submitterName: validatedData.submitterName,
      submitterEmail: validatedData.submitterEmail,
      submitterPhone: validatedData.submitterPhone,
      anonymous: validatedData.anonymous,
      tags: validatedData.tags || [],
      status: 'pending',
      publishedAt: null,
      consentToPublish: validatedData.consentToPublish,
      contentRights: validatedData.contentRights,
      termsAccepted: validatedData.termsAccepted,
    };

    // Map mediaFiles to files array format expected by Story model
    if (validatedData.mediaFiles && validatedData.mediaFiles.length > 0) {
      storyData.files = validatedData.mediaFiles.map(mediaData => ({
        name: mediaData.originalName || mediaData.filename,
        url: mediaData.url,
        type: mediaData.mediaType,
        size: mediaData.fileSize,
        thumbnailUrl: mediaData.thumbnailUrl,
      }));
    }

    const story = new Story(storyData);
    await story.save();

    // Create media records if files are provided
    if (validatedData.mediaFiles && validatedData.mediaFiles.length > 0) {
      const mediaPromises = validatedData.mediaFiles.map(mediaData => {
        // Derive storageKey from URL when using local uploads (e.g., /uploads/filename)
        const urlPath = mediaData.url || '';
        const normalized = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
        const storageKey = normalized; // e.g., uploads/uuid.ext

        const media = new Media({
          filename: mediaData.filename,
          originalName: mediaData.originalName || mediaData.filename,
          mimeType: mediaData.mimeType,
          fileSize: mediaData.fileSize,
          url: mediaData.url,
          thumbnailUrl: mediaData.thumbnailUrl,
          mediaType: mediaData.mediaType,
          associatedContent: {
            type: 'story',
            contentId: story._id
          },
          uploadedBy: null,
          processingStatus: 'completed',
          // Required by Media model
          storageProvider: 'local',
          storageKey,
          isPublic: true,
          accessLevel: 'public'
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
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: error.errors.map(e => ({
            path: e.path,
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Failed to create story';
    console.error('Story creation error:', errorMessage);
    
    return NextResponse.json(
      { success: false, error: errorMessage || 'Failed to create story' },
      { status: 500 }
    );
  }
}
