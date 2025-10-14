import { Schema, model, models } from 'mongoose';

// Article model for MatriArchive submissions and publications
// This model handles both user submissions and published articles
const ArticleSchema = new Schema({
  title: { type: String, required: true, maxlength: 300 },
  slug: { type: String, required: true, unique: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: { type: String, required: true }, // Store author name for display
  language: { type: String, required: true, default: 'en' },
  tags: [{ type: String, maxlength: 50 }],
  excerpt: { type: String, maxlength: 500 },
  body: { type: String, required: true }, // Rich text content
  coverImageUrl: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'in_review', 'approved', 'published', 'rejected'],
    default: 'pending'
  },
  // Submission details (for user-submitted articles)
  submitterName: { type: String },
  submitterEmail: { type: String },
  submitterPhone: { type: String },
  // Review details
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  publishedAt: { type: Date },
  // SEO and metadata
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  featured: { type: Boolean, default: false },
  // File attachments
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  // Analytics
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 }
}, { 
  timestamps: true,
  // Add indexes for performance
  indexes: [
    { status: 1, createdAt: -1 },
    { tags: 1 },
    { language: 1 },
    { featured: 1, status: 1 },
    { slug: 1 }
  ]
});

// Pre-save middleware to generate slug from title
ArticleSchema.pre('save', function(next) {
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
ArticleSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

export default models.Article || model('Article', ArticleSchema);
