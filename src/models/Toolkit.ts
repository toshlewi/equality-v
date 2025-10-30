import mongoose, { Schema, model, models } from 'mongoose';

const ToolkitSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  category: { 
    type: String, 
    enum: ['legal', 'advocacy', 'education', 'community', 'research', 'other'],
    required: true 
  },
  subcategory: { type: String },
  tags: [{ type: String }],
  featuredImage: { type: String },
  thumbnailImage: { type: String },
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
      required: true 
    },
    size: { type: Number, required: true },
    description: String,
    isPrimary: { type: Boolean, default: false }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  },
  isFeatured: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  // Access control
  accessLevel: { 
    type: String, 
    enum: ['public', 'member', 'admin'], 
    default: 'public' 
  },
  // Usage tracking
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Content metadata
  targetAudience: [{ type: String }],
  difficultyLevel: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: { type: String }, // e.g., "2 hours", "30 minutes"
  prerequisites: [{ type: String }],
  learningOutcomes: [{ type: String }],
  // Version control
  version: { type: String, default: '1.0' },
  lastUpdated: { type: Date, default: Date.now },
  changelog: [{ 
    version: String,
    changes: [String],
    date: { type: Date, default: Date.now }
  }],
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [{ type: String }],
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { title: 'text', description: 'text', tags: 'text' },
    { slug: 1 },
    { category: 1 },
    { status: 1 },
    { isFeatured: 1, status: 1 },
    { accessLevel: 1 },
    { difficultyLevel: 1 },
    { targetAudience: 1 }
  ]
});

// Virtual for formatted last updated date
ToolkitSchema.virtual('formattedLastUpdated').get(function() {
  return this.lastUpdated.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for average rating
ToolkitSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? (this.rating / this.reviewCount).toFixed(1) : 0;
});

// Virtual for primary file
ToolkitSchema.virtual('primaryFile').get(function() {
  return this.files.find(file => file.isPrimary) || this.files[0];
});

export default models.Toolkit || model('Toolkit', ToolkitSchema);
