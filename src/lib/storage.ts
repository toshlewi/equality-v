import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configure AWS SDK for Cloudflare R2
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error("Cloudflare R2 environment variables are not fully configured.");
  console.error("Missing:", {
    R2_ACCESS_KEY_ID: !!R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: !!R2_SECRET_ACCESS_KEY,
    R2_ACCOUNT_ID: !!R2_ACCOUNT_ID,
    R2_BUCKET_NAME: !!R2_BUCKET_NAME,
    R2_PUBLIC_URL: !!R2_PUBLIC_URL
  });
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadOptions {
  folder?: string;
  contentType?: string;
  expires?: number; // URL expiration in seconds
}

export interface FileMetadata {
  name: string;
  url: string;
  size: number;
  contentType: string;
  folder: string;
  uploadedAt: Date;
}

/**
 * Generate a presigned URL for direct client-side uploads
 */
export async function generatePresignedUploadUrl(
  filename: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> {
  const folder = options.folder || 'uploads';
  const fileExtension = filename.split('.').pop();
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const fileKey = `${folder}/${uniqueFilename}`;
  
  const expires = options.expires || 3600; // 1 hour default

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expires });
    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`;
    
    return {
      uploadUrl,
      fileKey,
      publicUrl
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

/**
 * Upload file directly from server
 */
export async function uploadFile(
  file: Buffer | Uint8Array | string,
  filename: string,
  options: UploadOptions = {}
): Promise<FileMetadata> {
  const folder = options.folder || 'uploads';
  const fileExtension = filename.split('.').pop();
  const uniqueFilename = `${uuidv4()}.${fileExtension}`;
  const fileKey = `${folder}/${uniqueFilename}`;
  
  const contentType = options.contentType || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: file,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`;
    
    return {
      name: filename,
      url: publicUrl,
      size: Buffer.isBuffer(file) ? file.length : file.length,
      contentType,
      folder,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    // Extract file key from URL
    const urlParts = fileUrl.split('/');
    const fileKey = urlParts.slice(-2).join('/'); // Get last two parts (folder/filename)
    
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Generate thumbnail for images
 */
export async function generateThumbnail(
  imageUrl: string,
  width: number = 300,
  height: number = 300
): Promise<string> {
  // For now, return the original URL
  // In production, you might want to use a service like Cloudinary or ImageKit
  // or implement server-side image processing
  return imageUrl;
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileKey: string): Promise<any | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey
    });

    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return null;
  }
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string, maxKeys: number = 100): Promise<any[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: folder,
      MaxKeys: maxKeys
    });

    const result = await s3Client.send(command);
    return result.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}

/**
 * Generate CDN URL for a file
 */
export function getCDNUrl(fileKey: string): string {
  return `${R2_PUBLIC_URL}/${fileKey}`;
}

/**
 * Check if file exists
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  try {
    const metadata = await getFileMetadata(fileKey);
    return metadata !== null;
  } catch (error) {
    return false;
  }
}

export default {
  generatePresignedUploadUrl,
  uploadFile,
  deleteFile,
  generateThumbnail,
  getFileMetadata,
  listFiles,
  getCDNUrl,
  fileExists
};
