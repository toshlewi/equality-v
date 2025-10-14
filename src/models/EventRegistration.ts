import { Schema, model, models } from 'mongoose';

// EventRegistration model for managing event attendees and their details
// Links events with attendees and handles payment tracking
const EventRegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  // Attendee details
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 255 },
  phone: { type: String, required: true, maxlength: 20 },
  // Ticket information
  ticketType: { type: String, required: true },
  ticketQuantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  // Payment details
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentProvider: { type: String, enum: ['stripe', 'mpesa', 'bank_transfer', 'free'] },
  paymentId: { type: String }, // Stripe payment intent ID or M-Pesa transaction ID
  paymentMethod: { type: String }, // card, mobile_money, bank_transfer
  // Discounts and promotions
  discountCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  memberDiscount: { type: Number, default: 0 },
  // Registration status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'no_show', 'attended'],
    default: 'pending'
  },
  // Additional attendee information
  dietaryRequirements: { type: String, maxlength: 500 },
  accessibilityNeeds: { type: String, maxlength: 500 },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  // Check-in information
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Communication
  confirmationSent: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  ticketSent: { type: Boolean, default: false },
  // Notes and special requirements
  notes: { type: String, maxlength: 1000 },
  specialRequests: { type: String, maxlength: 500 },
  // Refund information
  refundRequested: { type: Boolean, default: false },
  refundRequestedAt: { type: Date },
  refundAmount: { type: Number },
  refundReason: { type: String },
  refundProcessedAt: { type: Date },
  refundProcessedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Ticket generation
  ticketId: { type: String, unique: true },
  qrCode: { type: String }, // QR code data for check-in
  // Member association
  memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
  isMember: { type: Boolean, default: false }
}, { 
  timestamps: true,
  indexes: [
    { eventId: 1, status: 1 },
    { email: 1 },
    { paymentStatus: 1 },
    { ticketId: 1 },
    { memberId: 1 },
    { checkedIn: 1 }
  ]
});

// Pre-save middleware to generate ticket ID and calculate total amount
EventRegistrationSchema.pre('save', function(next) {
  // Generate unique ticket ID
  if (!this.ticketId) {
    this.ticketId = `EV-${this._id.toString().slice(-8).toUpperCase()}`;
  }
  
  // Calculate total amount
  this.totalAmount = (this.ticketQuantity * this.unitPrice) - this.discountAmount - this.memberDiscount;
  
  next();
});

// Virtual for formatted registration date
EventRegistrationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Virtual for payment status display
EventRegistrationSchema.virtual('paymentStatusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Payment',
    paid: 'Paid',
    failed: 'Payment Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };
  return statusMap[this.paymentStatus] || this.paymentStatus;
});

export default models.EventRegistration || model('EventRegistration', EventRegistrationSchema);