import { Schema, model, models } from 'mongoose';

const NewsSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 500 },
  featuredImage: { type: String },
  images: [{ type: String }],
  category: { 
    type: String, 
    enum: ['announcement', 'update', 'event', 'achievement', 'partnership', 'other'],
    required: true 
  },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  isFeatured: { type: Boolean, default: false },
  isBreaking: { type: Boolean, default: false },
  // Social media integration
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    linkedin: { type: String }
  },
  // Engagement tracking
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [{ type: String }],
  // Related content
  relatedPublications: [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
  relatedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  relatedStories: [{ type: Schema.Types.ObjectId, ref: 'Story' }],
  // Author information
  author: {
    name: { type: String, required: true },
    bio: String,
    image: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      website: String
    }
  },
  // Publishing metadata
  publishSchedule: { type: Date },
  isScheduled: { type: Boolean, default: false },
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { title: 'text', content: 'text', tags: 'text' },
    { slug: 1 },
    { status: 1, publishedAt: -1 },
    { category: 1 },
    { isFeatured: 1, status: 1 },
    { isBreaking: 1, status: 1 },
    { publishSchedule: 1 },
    { 'author.name': 1 }
  ]
});

// Virtual for formatted published date
NewsSchema.virtual('formattedPublishedAt').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time estimate
NewsSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for social engagement score
NewsSchema.virtual('engagementScore').get(function() {
  return this.viewCount + (this.shareCount * 2) + (this.likeCount * 1.5) + (this.commentCount * 3);
});

// Pre-save middleware to set publishedAt when status changes to published
NewsSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default models.News || model('News', NewsSchema);
