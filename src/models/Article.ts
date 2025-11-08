import { Schema, model, models } from 'mongoose';

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: String,
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorBio: String,
  category: { 
    type: String, 
    enum: ['publication', 'blog', 'report', 'news', 'story'],
    required: true 
  },
  tags: [String],
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'pending' 
  },
  featuredImage: String,
  images: [String],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  publishedAt: Date,
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: true },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  reviewNotes: String,
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  submissionId: { type: Schema.Types.ObjectId, ref: 'Submission' }
}, { 
  timestamps: true,
  indexes: [
    { slug: 1 },
    { status: 1 },
    { category: 1 },
    { publishedAt: -1 },
    { title: 'text', content: 'text', excerpt: 'text' }
  ]
});

export default models.Article || model('Article', ArticleSchema);