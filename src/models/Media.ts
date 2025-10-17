import { Schema, model, models } from 'mongoose';

// Media model for storing file metadata and references
// Used for videos, audio, images, and PDFs in Our Voices section
const MediaSchema = new Schema({
  // File identification
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  
  // Storage information
  url: { type: String, required: true }, // S3 or CDN URL
  thumbnailUrl: { type: String }, // For video/image previews
  storageProvider: { 
    type: String, 
    enum: ['s3', 'cloudinary', 'local'],
    default: 's3'
  },
  storageKey: { type: String, required: true }, // S3 key or similar
  
  // Media type and properties
  mediaType: { 
    type: String, 
    enum: ['image', 'video', 'audio', 'pdf'],
    required: true 
  },
  duration: { type: Number }, // For audio/video in seconds
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  },
  
  // Content information
  title: { type: String },
  description: { type: String },
  tags: [{ type: String, maxlength: 50 }],
  
  // Association with content
  associatedContent: {
    type: { 
      type: String, 
      enum: ['story', 'video_resource', 'audio_podcast', 'publication'],
      required: true 
    },
    contentId: { type: Schema.Types.ObjectId, required: true }
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processingError: { type: String },
  
  // Access control
  isPublic: { type: Boolean, default: true },
  accessLevel: { 
    type: String, 
    enum: ['public', 'authenticated', 'admin'],
    default: 'public'
  },
  
  // Analytics
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // Metadata
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  
  // Content moderation
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: { type: String },
  moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date }
}, { 
  timestamps: true,
  indexes: [
    { 'associatedContent.type': 1, 'associatedContent.contentId': 1 },
    { mediaType: 1, processingStatus: 1 },
    { uploadedBy: 1, uploadedAt: -1 },
    { moderationStatus: 1, uploadedAt: -1 },
    { tags: 1 },
    { isPublic: 1, accessLevel: 1 }
  ]
});

// Virtual for file size in human readable format
MediaSchema.virtual('formattedSize').get(function() {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for duration in human readable format
MediaSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for aspect ratio
MediaSchema.virtual('aspectRatio').get(function() {
  if (!this.dimensions?.width || !this.dimensions?.height) return null;
  return this.dimensions.width / this.dimensions.height;
});

export default models.Media || model('Media', MediaSchema);
