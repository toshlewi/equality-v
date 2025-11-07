import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { ApiResponse } from '@/lib/api-utils';
import { sanitizeInput } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg"
];

// POST /api/upload - Handle file uploads (legacy endpoint, use /api/uploads/direct instead)
export async function POST(request: NextRequest) {
  try {
    // Require authentication for uploads
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    // Only admins and editors can upload files
    if (!['admin', 'editor'].includes(session.user.role)) {
      return ApiResponse.forbidden('Insufficient permissions');
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return ApiResponse.error("No files provided", 400);
    }

    // Limit number of files per request
    if (files.length > 10) {
      return ApiResponse.error("Maximum 10 files allowed per request", 400);
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return ApiResponse.error(`File type ${file.type} not allowed`, 400);
      }

      // Validate file size (200MB max for videos, 10MB for others)
      const maxSize = file.type.startsWith('video/') ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
      const maxSizeLabel = file.type.startsWith('video/') ? '200MB' : '10MB';
      if (file.size > maxSize) {
        return ApiResponse.error(`File ${file.name} is too large. Maximum size is ${maxSizeLabel}.`, 400);
      }

      // Validate filename (sanitize)
      const sanitizedFileName = sanitizeInput(file.name).replace(/[^a-zA-Z0-9._-]/g, '');
      if (!sanitizedFileName || sanitizedFileName.length < 1) {
        return ApiResponse.error('Invalid filename', 400);
      }

      // Generate unique filename
      const fileExtension = sanitizedFileName.split(".").pop() || 'bin';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Save file
      const filePath = join(uploadsDir, uniqueFileName);
      const bytes = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(bytes));

      // Store file metadata
      uploadedFiles.push({
        name: sanitizedFileName,
        url: `/uploads/${uniqueFileName}`,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString()
      });

      // Log upload in audit log
      await createAuditLog({
        eventType: 'file_upload',
        description: `File uploaded: ${sanitizedFileName} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userRole: session.user.role,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        requestMethod: 'POST',
        requestUrl: request.url,
        metadata: {
          fileName: sanitizedFileName,
          fileSize: file.size,
          fileType: file.type,
          url: `/uploads/${uniqueFileName}`
        },
        severity: 'low',
        status: 'success'
      });
    }

    return ApiResponse.success(uploadedFiles);

  } catch (error) {
    console.error("Error uploading files:", error);
    return ApiResponse.error(
      "Failed to upload files",
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
