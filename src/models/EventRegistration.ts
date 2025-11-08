import { Schema, model, models } from 'mongoose';

const EventRegistrationSchema = new Schema({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  attendeeName: { type: String, required: true },
  attendeeEmail: { type: String, required: true },
  attendeePhone: String,
  ticketCount: { type: Number, default: 1, min: 1 },
  ticketType: { type: String, default: 'general' }, // general, vip, early_bird, etc.
  // Payment information
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'mpesa', 'free', 'bank_transfer'],
    default: 'free' 
  },
  paymentId: String, // Stripe PaymentIntent ID or M-Pesa transaction ID
  paymentIntentId: String, // Stripe PaymentIntent ID
  transactionId: String,
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  discountCode: String,
  discountAmount: { type: Number, default: 0 },
  // Registration details
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'],
    default: 'pending' 
  },
  confirmationCode: { type: String, unique: true, sparse: true },
  qrCode: String, // QR code URL or data
  // Additional information
  specialRequirements: String,
  dietaryRestrictions: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  registrationData: {
    type: Map,
    of: Schema.Types.Mixed
  },
  // Check-in
  checkedIn: { type: Boolean, default: false },
  checkedInAt: Date,
  checkedInBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Email tracking
  confirmationEmailSent: { type: Boolean, default: false },
  confirmationEmailSentAt: Date,
  reminderEmailSent: { type: Boolean, default: false },
  reminderEmailSentAt: Date,
  // Notes
  notes: String,
  // Metadata
  ipAddress: String,
  userAgent: String,
  source: String, // How they found the event
  createdAt: Date,
  updatedAt: Date
}, { 
  timestamps: true,
  indexes: [
    { eventId: 1 },
    { attendeeEmail: 1 },
    { confirmationCode: 1 },
    { paymentStatus: 1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

// Pre-save middleware to generate confirmation code
EventRegistrationSchema.pre('save', async function(next) {
  if (!this.confirmationCode) {
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const eventCode = this.eventId?.toString().slice(-4).toUpperCase() || 'EV';
    this.confirmationCode = `${eventCode}-${randomCode}`;
  }
  next();
});

export default models.EventRegistration || model('EventRegistration', EventRegistrationSchema);
