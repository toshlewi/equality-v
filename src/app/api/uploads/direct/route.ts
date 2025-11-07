import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { uploadFile } from '@/lib/storage';
import { validateFileUpload, ApiResponse } from '@/lib/api-utils';
import { sanitizeInput } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain',
  'text/csv',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  // Audio
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/ogg'
];

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  document: 50 * 1024 * 1024, // 50MB
  video: 200 * 1024 * 1024, // 200MB
  audio: 50 * 1024 * 1024, // 50MB
  default: 10 * 1024 * 1024 // 10MB
};

// POST /api/uploads/direct - Uploads a file via server to storage, returns public URL
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

    const form = await request.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || 'uploads';

    if (!file) {
      return ApiResponse.error('No file provided', 400);
    }

    // Sanitize folder name
    const sanitizedFolder = sanitizeInput(folder).replace(/[^a-z0-9-_]/gi, '');

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return ApiResponse.error(`File type ${file.type} is not allowed. Allowed types: images, documents, videos, audio.`, 400);
    }

    // Validate file size
    let maxSize = MAX_FILE_SIZES.default;
    if (file.type.startsWith('image/')) {
      maxSize = MAX_FILE_SIZES.image;
    } else if (file.type.startsWith('application/') || file.type.startsWith('text/')) {
      maxSize = MAX_FILE_SIZES.document;
    } else if (file.type.startsWith('video/')) {
      maxSize = MAX_FILE_SIZES.video;
    } else if (file.type.startsWith('audio/')) {
      maxSize = MAX_FILE_SIZES.audio;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      return ApiResponse.error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`, 400);
    }

    // Additional security: validate file extension matches MIME type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const extensionMimeMap: Record<string, string[]> = {
      'jpg': ['image/jpeg', 'image/jpg'],
      'jpeg': ['image/jpeg', 'image/jpg'],
      'png': ['image/png'],
      'gif': ['image/gif'],
      'webp': ['image/webp'],
      'pdf': ['application/pdf'],
      'doc': ['application/msword'],
      'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'xls': ['application/vnd.ms-excel'],
      'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      'ppt': ['application/vnd.ms-powerpoint'],
      'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      'txt': ['text/plain'],
      'csv': ['text/csv'],
      'mp4': ['video/mp4'],
      'webm': ['video/webm'],
      'mov': ['video/quicktime'],
      'mp3': ['audio/mpeg', 'audio/mp3'],
      'wav': ['audio/wav'],
      'ogg': ['audio/ogg']
    };

    if (fileExtension && extensionMimeMap[fileExtension]) {
      if (!extensionMimeMap[fileExtension].includes(file.type)) {
        return ApiResponse.error('File extension does not match file type', 400);
      }
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to storage
    const meta = await uploadFile(buffer, file.name, { 
      folder: sanitizedFolder, 
      contentType: file.type 
    });

    // Log upload in audit log
    await createAuditLog({
      eventType: 'file_upload',
      description: `File uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      userId: session.user.id,
      userEmail: session.user.email || '',
      userRole: session.user.role,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      requestMethod: 'POST',
      requestUrl: request.url,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        folder: sanitizedFolder,
        url: meta.url
      },
      severity: 'low',
      status: 'success'
    });

    return ApiResponse.success({ 
      url: meta.url, 
      name: meta.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Direct upload failed:', error);
    return ApiResponse.error(
      'Upload failed',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}


