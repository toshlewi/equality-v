import mongoose, { Schema, model, models } from 'mongoose';

const PublicationSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, maxlength: 500 },
  featuredImage: { type: String },
  pdfUrl: { type: String },
  category: { 
    type: String, 
    enum: ['article', 'blog', 'report'], 
    required: true 
  },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'archived'], 
    default: 'draft' 
  },
  publishedAt: { type: Date },
  viewCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  seoTitle: String,
  seoDescription: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { title: 'text', content: 'text', tags: 'text' },
    { status: 1, publishedAt: -1 },
    { slug: 1 },
    { category: 1 },
    { isFeatured: 1, status: 1 },
    { createdBy: 1 }
  ]
});

// Virtual for formatted published date
PublicationSchema.virtual('formattedPublishedAt').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for reading time estimate
PublicationSchema.virtual('readingTime').get(function() {
  if (!this.content) return 0;
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

export default models.Publication || model('Publication', PublicationSchema);
