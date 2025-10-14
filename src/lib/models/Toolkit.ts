import { Schema, model, models } from 'mongoose';

// Toolkit model for MatriArchive toolkits and guides
const ToolkitSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: 300,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  author: { 
    type: String, 
    required: true,
    maxlength: 200,
    trim: true
  },
  authorEmail: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Guide', 'Toolkit', 'Manual', 'Framework', 'Template', 'Checklist'],
    default: 'Guide'
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 1000,
    trim: true
  },
  content: { 
    type: String,
    trim: true
  },
  // File attachments
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // pdf, doc, docx, xlsx, ppt
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Cover image for display
  coverImage: {
    url: String,
    alt: String
  },
  // Status for moderation workflow
  status: { 
    type: String, 
    enum: ['pending', 'in_review', 'approved', 'published', 'rejected'],
    default: 'pending'
  },
  // Review details
  reviewerId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewNotes: { 
    type: String,
    maxlength: 1000
  },
  reviewedAt: { 
    type: Date 
  },
  publishedAt: { 
    type: Date 
  },
  // Tags for categorization and search
  tags: [{
    type: String,
    maxlength: 50,
    trim: true
  }],
  // Target audience
  targetAudience: [{
    type: String,
    enum: ['Activists', 'Researchers', 'Students', 'Organizations', 'General Public'],
    default: 'General Public'
  }],
  // Difficulty level
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  // Estimated time to complete
  estimatedTime: {
    type: String,
    maxlength: 100 // e.g., "2-3 hours", "1 day"
  },
  // Language
  language: {
    type: String,
    default: 'English'
  },
  // Version control
  version: {
    type: String,
    default: '1.0'
  },
  // SEO and metadata
  metaTitle: { 
    type: String, 
    maxlength: 60 
  },
  metaDescription: { 
    type: String, 
    maxlength: 160 
  },
  // Featured content flag
  featured: { 
    type: Boolean, 
    default: false 
  },
  // Analytics
  viewCount: { 
    type: Number, 
    default: 0 
  },
  downloadCount: { 
    type: Number, 
    default: 0 
  },
  likeCount: { 
    type: Number, 
    default: 0 
  },
  // Submission details
  submittedBy: {
    name: String,
    email: String,
    organization: String
  }
}, { 
  timestamps: true,
  // Add indexes for performance
  indexes: [
    { status: 1, createdAt: -1 },
    { category: 1, status: 1 },
    { tags: 1 },
    { targetAudience: 1 },
    { difficultyLevel: 1 },
    { featured: 1, status: 1 },
    { slug: 1 },
    { author: 1 },
    { publishedAt: -1 }
  ]
});

// Pre-save middleware to generate slug from title
ToolkitSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Virtual for formatted creation date
ToolkitSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted published date
ToolkitSchema.virtual('formattedPublishedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to increment view count
ToolkitSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment download count
ToolkitSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  return this.save();
};

// Static method to get published toolkits
ToolkitSchema.statics.getPublished = function() {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

// Static method to get featured toolkits
ToolkitSchema.statics.getFeatured = function() {
  return this.find({ status: 'published', featured: true }).sort({ publishedAt: -1 });
};

// Static method to get toolkits by category
ToolkitSchema.statics.getByCategory = function(category) {
  return this.find({ status: 'published', category }).sort({ publishedAt: -1 });
};

// Static method to get toolkits by target audience
ToolkitSchema.statics.getByTargetAudience = function(audience) {
  return this.find({ status: 'published', targetAudience: audience }).sort({ publishedAt: -1 });
};

export default models.Toolkit || model('Toolkit', ToolkitSchema);
