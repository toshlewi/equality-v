import { z } from 'zod';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  PDF: 20 * 1024 * 1024,  // 20MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 200 * 1024 * 1024, // 200MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

// Allowed MIME types
export const ALLOWED_MIME_TYPES = {
  IMAGE: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  PDF: [
    'application/pdf'
  ],
  AUDIO: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/aac',
    'audio/ogg'
  ],
  VIDEO: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/avi'
  ],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/rtf'
  ]
} as const;

export type MediaType = 'image' | 'pdf' | 'audio' | 'video' | 'document';

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  mediaType?: MediaType;
  sanitizedFilename?: string;
}

/**
 * Validate file type based on MIME type
 */
export function validateFileType(mimeType: string, mediaType: MediaType): boolean {
  const allowedTypes = ALLOWED_MIME_TYPES[mediaType.toUpperCase() as keyof typeof ALLOWED_MIME_TYPES];
  return allowedTypes.includes(mimeType);
}

/**
 * Validate file size based on media type
 */
export function validateFileSize(fileSize: number, mediaType: MediaType): boolean {
  const sizeLimit = FILE_SIZE_LIMITS[mediaType.toUpperCase() as keyof typeof FILE_SIZE_LIMITS];
  return fileSize <= sizeLimit;
}

/**
 * Detect media type from MIME type
 */
export function detectMediaType(mimeType: string): MediaType | null {
  if (ALLOWED_MIME_TYPES.IMAGE.includes(mimeType)) return 'image';
  if (ALLOWED_MIME_TYPES.PDF.includes(mimeType)) return 'pdf';
  if (ALLOWED_MIME_TYPES.AUDIO.includes(mimeType)) return 'audio';
  if (ALLOWED_MIME_TYPES.VIDEO.includes(mimeType)) return 'video';
  if (ALLOWED_MIME_TYPES.DOCUMENT.includes(mimeType)) return 'document';
  return null;
}

/**
 * Sanitize filename to prevent security issues
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file comprehensively
 */
export function validateFile(
  file: {
    name: string;
    size: number;
    type: string;
  },
  expectedMediaType?: MediaType
): FileValidationResult {
  const errors: string[] = [];
  
  // Detect media type
  const detectedMediaType = detectMediaType(file.type);
  if (!detectedMediaType) {
    errors.push(`Unsupported file type: ${file.type}`);
    return { isValid: false, errors };
  }

  // Check if media type matches expected type
  if (expectedMediaType && detectedMediaType !== expectedMediaType) {
    errors.push(`Expected ${expectedMediaType} file, got ${detectedMediaType}`);
    return { isValid: false, errors };
  }

  // Validate file size
  if (!validateFileSize(file.size, detectedMediaType)) {
    const sizeLimit = FILE_SIZE_LIMITS[detectedMediaType.toUpperCase() as keyof typeof FILE_SIZE_LIMITS];
    const sizeInMB = Math.round(sizeLimit / (1024 * 1024));
    errors.push(`File size exceeds ${sizeInMB}MB limit for ${detectedMediaType} files`);
  }

  // Validate filename
  if (!file.name || file.name.trim().length === 0) {
    errors.push('Filename is required');
  }

  // Check for dangerous file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const extension = getFileExtension(file.name);
  if (dangerousExtensions.includes(`.${extension}`)) {
    errors.push('File type not allowed for security reasons');
  }

  // Sanitize filename
  const sanitizedFilename = sanitizeFilename(file.name);

  return {
    isValid: errors.length === 0,
    errors,
    mediaType: detectedMediaType,
    sanitizedFilename
  };
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>,
  expectedMediaType?: MediaType
): FileValidationResult[] {
  return files.map(file => validateFile(file, expectedMediaType));
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.IMAGE.includes(mimeType);
}

/**
 * Check if file is a PDF
 */
export function isPdfFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.PDF.includes(mimeType);
}

/**
 * Check if file is an audio file
 */
export function isAudioFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.AUDIO.includes(mimeType);
}

/**
 * Check if file is a video file
 */
export function isVideoFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.VIDEO.includes(mimeType);
}

/**
 * Check if file is a document
 */
export function isDocumentFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.DOCUMENT.includes(mimeType);
}

// Zod schemas for API validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().positive('File size must be positive'),
  mediaType: z.enum(['image', 'pdf', 'audio', 'video', 'document'])
});

export const multipleFileUploadSchema = z.object({
  files: z.array(fileUploadSchema).min(1, 'At least one file is required')
});

export default {
  validateFile,
  validateFiles,
  validateFileType,
  validateFileSize,
  detectMediaType,
  sanitizeFilename,
  getFileExtension,
  formatFileSize,
  isImageFile,
  isPdfFile,
  isAudioFile,
  isVideoFile,
  isDocumentFile,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES
};
