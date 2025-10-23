import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePresignedUploadUrl } from '@/lib/storage';
import { validateFile, multipleFileUploadSchema } from '@/lib/file-validation';

// POST /api/uploads/request - Request signed upload URLs
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = multipleFileUploadSchema.parse(body);

    // Validate each file
    const validationResults = validatedData.files.map(file => 
      validateFile({
        name: file.filename,
        size: file.fileSize,
        type: file.mimeType
      }, file.mediaType)
    );

    // Check if any files are invalid
    const invalidFiles = validationResults.filter(result => !result.isValid);
    if (invalidFiles.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File validation failed', 
          details: invalidFiles.map((result, index) => ({
            file: validatedData.files[index].filename,
            errors: result.errors
          }))
        },
        { status: 400 }
      );
    }

    // Generate presigned URLs for valid files
    const signedUrls = await Promise.all(
      validatedData.files.map(async (file, index) => {
        const validationResult = validationResults[index];
        const sanitizedFilename = validationResult.sanitizedFilename || file.filename;
        
        const { uploadUrl, fileKey, publicUrl } = await generatePresignedUploadUrl(
          sanitizedFilename,
          file.mimeType,
          {
            folder: file.mediaType,
            expires: 3600 // 1 hour
          }
        );
        
        return {
          filename: file.filename,
          sanitizedFilename,
          fileKey,
          uploadUrl,
          publicUrl,
          mediaType: file.mediaType,
          mimeType: file.mimeType,
          fileSize: file.fileSize
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        uploads: signedUrls
      }
    });

  } catch (error) {
    console.error('Error generating upload URLs:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URLs' },
      { status: 500 }
    );
  }
}
