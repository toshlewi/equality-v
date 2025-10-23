import { Schema, model, models } from 'mongoose';

// Donation model for managing all types of donations (cash, product, service, other)
// Handles both monetary and non-monetary donations with different workflows
const DonationSchema = new Schema({
  // Donor information
  donorName: { type: String, required: true, maxlength: 100 },
  donorEmail: { type: String, required: true, maxlength: 255 },
  donorPhone: { type: String, maxlength: 20 },
  donorAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String }
  },
  // Donation details
  donationType: { 
    type: String, 
    enum: ['cash', 'product', 'service', 'other'],
    required: true 
  },
  amount: { type: Number }, // For cash donations
  currency: { type: String, default: 'USD' },
  description: { type: String, maxlength: 1000 }, // For non-cash donations
  // Campaign and categorization
  campaignTag: { type: String, maxlength: 50 }, // Link to specific fundraising campaign
  category: { 
    type: String, 
    enum: ['general', 'program_specific', 'emergency', 'infrastructure', 'other'],
    default: 'general'
  },
  // Payment information (for cash donations)
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentProvider: { type: String, enum: ['stripe', 'mpesa', 'bank_transfer', 'cash', 'check'] },
  paymentId: { type: String }, // Stripe payment intent ID or M-Pesa transaction ID
  paymentMethod: { type: String },
  // Non-monetary donation details
  itemDetails: {
    name: { type: String },
    quantity: { type: Number },
    condition: { type: String },
    estimatedValue: { type: Number },
    pickupRequired: { type: Boolean, default: false },
    pickupAddress: { type: String },
    pickupDate: { type: Date },
    pickupNotes: { type: String }
  },
  // Service donation details
  serviceDetails: {
    serviceType: { type: String },
    duration: { type: String }, // e.g., "2 hours", "1 day"
    skills: [{ type: String }],
    availability: { type: String },
    specialRequirements: { type: String }
  },
  // Status and processing
  status: { 
    type: String, 
    enum: ['pending', 'received', 'processed', 'acknowledged', 'rejected'],
    default: 'pending'
  },
  // Processing details
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date },
  processingNotes: { type: String, maxlength: 1000 },
  // Receipt and acknowledgment
  receiptSent: { type: Boolean, default: false },
  receiptSentAt: { type: Date },
  acknowledgmentSent: { type: Boolean, default: false },
  acknowledgmentSentAt: { type: Date },
  // Tax and legal
  taxDeductible: { type: Boolean, default: true },
  taxReceiptNumber: { type: String },
  taxReceiptSent: { type: Boolean, default: false },
  taxReceiptSentAt: { type: Date },
  // Refund information
  refundRequested: { type: Boolean, default: false },
  refundRequestedAt: { type: Date },
  refundAmount: { type: Number },
  refundReason: { type: String },
  refundProcessedAt: { type: Date },
  refundProcessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Communication preferences
  newsletterSubscribed: { type: Boolean, default: true },
  emailUpdates: { type: Boolean, default: true },
  // Anonymous donation option
  anonymous: { type: Boolean, default: false },
  // Member association
  memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
  isMember: { type: Boolean, default: false },
  // Additional notes
  notes: { type: String, maxlength: 1000 },
  // Legal and consent
  termsAccepted: { type: Boolean, required: true },
  privacyAccepted: { type: Boolean, required: true }
}, { 
  timestamps: true,
  indexes: [
    { donationType: 1, status: 1 },
    { paymentStatus: 1 },
    { campaignTag: 1 },
    { category: 1 },
    { donorEmail: 1 },
    { memberId: 1 },
    { anonymous: 1, status: 1 },
    { createdAt: -1 },
    { donationType: 1, createdAt: -1 },
    { status: 1, createdAt: -1 },
    { amount: -1 },
    { processedBy: 1, processedAt: -1 }
  ]
});

// Virtual for display name (anonymous or actual name)
DonationSchema.virtual('displayName').get(function() {
  return this.anonymous ? 'Anonymous Donor' : this.donorName;
});

// Virtual for formatted donation amount
DonationSchema.virtual('formattedAmount').get(function() {
  if (this.donationType === 'cash' && this.amount) {
    return `${this.currency} ${this.amount.toLocaleString()}`;
  }
  return this.description || 'Non-monetary donation';
});

// Virtual for donation status display
DonationSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending',
    received: 'Received',
    processed: 'Processed',
    acknowledged: 'Acknowledged',
    rejected: 'Rejected'
  };
  return statusMap[this.status] || this.status;
});

export default models.Donation || model('Donation', DonationSchema);