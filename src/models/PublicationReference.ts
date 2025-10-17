import { Schema, model, models } from 'mongoose';

// PublicationReference model for linking Our Voices content to MatriArchive publications
// This creates a bridge between user-generated content and curated publications
const PublicationReferenceSchema = new Schema({
  // Reference identification
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  
  // Source content (from Our Voices)
  sourceType: { 
    type: String, 
    enum: ['story', 'video', 'audio', 'image'],
    required: true 
  },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  sourceTitle: { type: String, required: true },
  sourceAuthor: { type: String, required: true },
  sourceUrl: { type: String }, // Link back to original content
  
  // Target publication (in MatriArchive)
  publicationType: { 
    type: String, 
    enum: ['article', 'blog', 'report', 'toolkit', 'guide'],
    required: true 
  },
  publicationId: { type: Schema.Types.ObjectId, ref: 'Article' },
  publicationTitle: { type: String, required: true },
  publicationUrl: { type: String },
  
  // Relationship details
  relationshipType: {
    type: String,
    enum: ['inspired_by', 'references', 'supports', 'contradicts', 'extends', 'examples'],
    required: true
  },
  relationshipDescription: { type: String, maxlength: 500 },
  
  // Content curation
  excerpt: { type: String, maxlength: 1000 }, // Selected excerpt from source
  keyQuotes: [{ 
    text: { type: String, maxlength: 500 },
    context: { type: String, maxlength: 200 }
  }],
  
  // Categorization
  tags: [{ type: String, maxlength: 50 }],
  categories: [{ type: String, maxlength: 50 }],
  topics: [{ type: String, maxlength: 50 }],
  
  // Status and workflow
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  
  // Review process
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNotes: { type: String, maxlength: 1000 },
  
  // Publishing
  publishedAt: { type: Date },
  publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Visibility and access
  isPublic: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  priority: { type: Number, default: 0 }, // For ordering
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lastModifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  // Content quality
  qualityScore: { type: Number, min: 0, max: 10 },
  relevanceScore: { type: Number, min: 0, max: 10 },
  impactScore: { type: Number, min: 0, max: 10 },
  
  // Legal and compliance
  hasPermission: { type: Boolean, default: false },
  permissionNotes: { type: String, maxlength: 500 },
  attributionRequired: { type: Boolean, default: true },
  
  // Version control
  version: { type: Number, default: 1 },
  previousVersions: [{ 
    version: { type: Number },
    data: { type: Schema.Types.Mixed },
    changedAt: { type: Date },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}, { 
  timestamps: true,
  indexes: [
    { sourceType: 1, sourceId: 1 },
    { publicationType: 1, publicationId: 1 },
    { status: 1, publishedAt: -1 },
    { tags: 1, categories: 1 },
    { createdBy: 1, createdAt: -1 },
    { isPublic: 1, featured: 1, priority: -1 },
    { qualityScore: -1, relevanceScore: -1, impactScore: -1 }
  ]
});

// Virtual for formatted creation date
PublicationReferenceSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted published date
PublicationReferenceSchema.virtual('formattedPublishedAt').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for overall quality score
PublicationReferenceSchema.virtual('overallScore').get(function() {
  if (!this.qualityScore || !this.relevanceScore || !this.impactScore) return null;
  return (this.qualityScore + this.relevanceScore + this.impactScore) / 3;
});

// Pre-save middleware to update version
PublicationReferenceSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.lastModifiedBy = this.createdBy; // This should be updated with actual user
  }
  next();
});

export default models.PublicationReference || model('PublicationReference', PublicationReferenceSchema);
