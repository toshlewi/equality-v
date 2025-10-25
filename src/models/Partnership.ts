import mongoose, { Schema, model, models } from 'mongoose';

const PartnershipSchema = new Schema({
  name: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  logo: { type: String },
  website: { type: String },
  email: { type: String },
  phone: { type: String },
  // Organization details
  organizationType: { 
    type: String, 
    enum: ['ngo', 'government', 'academic', 'private', 'international', 'other'],
    required: true 
  },
  focusAreas: [{ 
    type: String, 
    enum: ['gender-justice', 'legal-advocacy', 'education', 'health', 'economic-empowerment', 'digital-rights', 'climate-justice', 'other']
  }],
  // Geographic scope
  geographicScope: { 
    type: String, 
    enum: ['local', 'national', 'regional', 'continental', 'global'],
    required: true 
  },
  countries: [{ type: String }],
  // Partnership details
  partnershipType: { 
    type: String, 
    enum: ['strategic', 'programmatic', 'funding', 'technical', 'advocacy', 'research', 'other'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'expired', 'terminated'], 
    default: 'pending' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  // Contact information
  primaryContact: {
    name: { type: String, required: true },
    title: String,
    email: { type: String, required: true },
    phone: String
  },
  // Partnership activities
  activities: [{
    title: { type: String, required: true },
    description: String,
    startDate: Date,
    endDate: Date,
    status: { 
      type: String, 
      enum: ['planned', 'ongoing', 'completed', 'cancelled'], 
      default: 'planned' 
    },
    outcomes: [String]
  }],
  // Financial information
  funding: {
    amount: { type: Number },
    currency: { type: String, default: 'USD' },
    type: { 
      type: String, 
      enum: ['grant', 'contract', 'donation', 'in-kind', 'other'] 
    },
    description: String
  },
  // Impact tracking
  impactMetrics: [{
    metric: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  // Documents and resources
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['agreement', 'report', 'proposal', 'other'] 
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Visibility and display
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  // Social media
  socialMedia: {
    twitter: String,
    facebook: String,
    linkedin: String,
    instagram: String
  },
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
    { name: 'text', description: 'text' },
    { slug: 1 },
    { status: 1 },
    { organizationType: 1 },
    { partnershipType: 1 },
    { geographicScope: 1 },
    { focusAreas: 1 },
    { isPublic: 1, status: 1 },
    { isFeatured: 1, status: 1 },
    { startDate: 1, endDate: 1 }
  ]
});

// Virtual for partnership duration
PartnershipSchema.virtual('duration').get(function() {
  if (!this.startDate) return null;
  const end = this.endDate || new Date();
  const start = new Date(this.startDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted start date
PartnershipSchema.virtual('formattedStartDate').get(function() {
  if (!this.startDate) return null;
  return this.startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for formatted end date
PartnershipSchema.virtual('formattedEndDate').get(function() {
  if (!this.endDate) return null;
  return this.endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for active activities count
PartnershipSchema.virtual('activeActivitiesCount').get(function() {
  return this.activities.filter(activity => activity.status === 'ongoing').length;
});

// Virtual for completed activities count
PartnershipSchema.virtual('completedActivitiesCount').get(function() {
  return this.activities.filter(activity => activity.status === 'completed').length;
});

export default models.Partnership || model('Partnership', PartnershipSchema);