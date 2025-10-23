import { Schema, model, models } from 'mongoose';

// Story model for Our Voices section - user-submitted stories with media support
// Supports text, image, audio, video, and PDF submissions
const StorySchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  submitterName: { type: String }, // Optional for anonymous submissions
  submitterEmail: { type: String },
  submitterPhone: { type: String },
  anonymous: { type: Boolean, default: false },
  tags: [{ type: String, maxlength: 50 }],
  text: { type: String, maxlength: 10000 }, // Story text content
  // Media files support
  files: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }, // image, audio, video, pdf
    size: { type: Number, required: true },
    thumbnailUrl: { type: String }, // For video/image previews
    duration: { type: Number }, // For audio/video duration in seconds
    dimensions: {
      width: { type: Number },
      height: { type: Number }
    }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'in_review', 'approved', 'published', 'rejected'],
    default: 'pending'
  },
  // Review details
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  publishedAt: { type: Date },
  // Content moderation
  contentWarnings: [{ type: String }], // For sensitive content
  ageRestricted: { type: Boolean, default: false },
  // Display options
  featured: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  // Analytics
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },
  // Consent and legal
  consentToPublish: { type: Boolean, required: true },
  contentRights: { type: Boolean, required: true }, // User confirms they own the content
  termsAccepted: { type: Boolean, required: true }
}, { 
  timestamps: true,
  indexes: [
    { status: 1, createdAt: -1 },
    { tags: 1 },
    { anonymous: 1, status: 1 },
    { featured: 1, status: 1 },
    { submitterEmail: 1 },
    { publishedAt: -1 },
    { viewCount: -1 },
    { likeCount: -1 }
  ]
});

// Add text search index for full-text search
StorySchema.index({
  title: 'text',
  text: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    text: 1
  },
  name: 'story_text_search'
});

// Virtual for display name (anonymous or actual name)
StorySchema.virtual('displayName').get(function() {
  return this.anonymous ? 'Anonymous' : this.submitterName;
});

// Virtual for formatted creation date
StorySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

export default models.Story || model('Story', StorySchema);