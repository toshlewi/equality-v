import { Schema, model, models } from 'mongoose';

// Contact model for general contact form submissions and inquiries
// Handles contact form submissions, support tickets, and general inquiries
const ContactSchema = new Schema({
  // Contact information
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 255 },
  phone: { type: String, maxlength: 20 },
  // Inquiry details
  subject: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 2000 },
  // Inquiry type and categorization
  inquiryType: { 
    type: String, 
    enum: ['general', 'support', 'partnership', 'media', 'volunteer', 'donation', 'other'],
    default: 'general'
  },
  category: { 
    type: String, 
    enum: ['website', 'membership', 'events', 'content', 'technical', 'billing', 'other'],
    default: 'general'
  },
  // Status and processing
  status: { 
    type: String, 
    enum: ['new', 'in_progress', 'resolved', 'closed', 'spam'],
    default: 'new'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Assignment and handling
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  // Response tracking
  responseRequired: { type: Boolean, default: true },
  responseSent: { type: Boolean, default: false },
  responseSentAt: { type: Date },
  responseMethod: { type: String, enum: ['email', 'phone', 'in_person'] },
  // Resolution
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String, maxlength: 1000 },
  // Communication history
  communicationHistory: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'note', 'internal'] },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isInternal: { type: Boolean, default: false }
  }],
  // Follow-up
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  followUpNotes: { type: String, maxlength: 500 },
  // Additional information
  source: { type: String }, // website, email, phone, referral
  referrer: { type: String }, // if referred by someone
  // Tags for organization
  tags: [{ type: String, maxlength: 50 }],
  // Customer satisfaction
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionFeedback: { type: String, maxlength: 500 },
  // Legal and consent
  termsAccepted: { type: Boolean, required: true },
  privacyAccepted: { type: Boolean, required: true },
  // Spam protection
  isSpam: { type: Boolean, default: false },
  spamScore: { type: Number, default: 0 },
  // Internal notes
  internalNotes: { type: String, maxlength: 1000 },
  // Related entities
  relatedEntity: {
    type: { type: String }, // 'member', 'order', 'event', etc.
    id: { type: Schema.Types.ObjectId }
  }
}, { 
  timestamps: true,
  indexes: [
    { status: 1, createdAt: -1 },
    { inquiryType: 1, status: 1 },
    { assignedTo: 1, status: 1 },
    { priority: 1, status: 1 },
    { email: 1 },
    { isSpam: 1, status: 1 }
  ]
});

// Virtual for formatted creation date
ContactSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for status display
ContactSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    new: 'New',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    spam: 'Spam'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for priority color
ContactSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return colorMap[this.priority] || 'blue';
});

// Virtual for time since creation
ContactSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.createdAt.toLocaleDateString();
});

export default models.Contact || model('Contact', ContactSchema);