import { Schema, model, models } from 'mongoose';

// Partnership model for managing partnership inquiries and relationships
// Handles partnership applications and ongoing relationships
const PartnershipSchema = new Schema({
  // Contact information
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 255 },
  phone: { type: String, maxlength: 20 },
  // Organization details
  organization: { type: String, required: true, maxlength: 200 },
  organizationType: { 
    type: String, 
    enum: ['ngo', 'corporate', 'government', 'academic', 'individual', 'other'],
    required: true 
  },
  website: { type: String },
  // Partnership details
  partnershipType: { 
    type: String, 
    enum: ['funding', 'program_partnership', 'in_kind', 'advocacy', 'research', 'other'],
    required: true 
  },
  proposedPartnership: { type: String, required: true, maxlength: 2000 },
  alignmentWithMission: { type: String, required: true, maxlength: 2000 },
  // Organization activities
  organizationActivities: { type: String, required: true, maxlength: 2000 },
  // Media and documents
  logo: { 
    url: { type: String },
    filename: { type: String },
    size: { type: Number }
  },
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true }
  }],
  // Status and processing
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'in_progress', 'approved', 'rejected', 'completed', 'on_hold'],
    default: 'pending'
  },
  // Review and assignment
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String, maxlength: 2000 },
  reviewedAt: { type: Date },
  // Partnership management
  partnershipManager: { type: Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date },
  endDate: { type: Date },
  // Financial details (if applicable)
  financialValue: { type: Number },
  currency: { type: String, default: 'USD' },
  // Communication history
  communicationHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'call', 'meeting', 'note'] },
    summary: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  // Follow-up and next steps
  nextFollowUp: { type: Date },
  nextSteps: { type: String, maxlength: 1000 },
  // Tags and categorization
  tags: [{ type: String, maxlength: 50 }],
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  // Legal and compliance
  termsAccepted: { type: Boolean, required: true },
  privacyAccepted: { type: Boolean, required: true },
  // Additional information
  additionalInfo: { type: String, maxlength: 2000 },
  // Internal notes
  internalNotes: { type: String, maxlength: 2000 },
  // Outcome tracking
  outcome: { type: String, maxlength: 1000 },
  outcomeDate: { type: Date },
  // Mailchimp integration
  mailchimpId: { type: String },
  mailchimpTags: [{ type: String }]
}, { 
  timestamps: true,
  indexes: [
    { status: 1, createdAt: -1 },
    { organizationType: 1, status: 1 },
    { partnershipType: 1, status: 1 },
    { assignedTo: 1, status: 1 },
    { tags: 1 },
    { priority: 1, status: 1 }
  ]
});

// Virtual for formatted creation date
PartnershipSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for status display
PartnershipSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Review',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    on_hold: 'On Hold'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for priority color
PartnershipSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    low: 'gray',
    medium: 'blue',
    high: 'red'
  };
  return colorMap[this.priority] || 'blue';
});

export default models.Partnership || model('Partnership', PartnershipSchema);
