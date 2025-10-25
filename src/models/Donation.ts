import mongoose, { Schema, model, models } from 'mongoose';

const DonationSchema = new Schema({
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  donationType: { 
    type: String, 
    enum: ['general', 'specific_campaign', 'monthly', 'one_time'],
    required: true 
  },
  campaign: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'mpesa', 'bank_transfer', 'paypal'],
    required: true 
  },
  paymentId: { type: String },
  transactionId: { type: String },
  isAnonymous: { type: Boolean, default: false },
  message: String,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  taxDeductible: { type: Boolean, default: true },
  receiptSent: { type: Boolean, default: false },
  receiptNumber: String,
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    nextPaymentDate: Date,
    subscriptionId: String
  },
  notes: String,
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date
}, { 
  timestamps: true,
  indexes: [
    { donorEmail: 1 },
    { status: 1 },
    { donationType: 1 },
    { createdAt: -1 },
    { amount: -1 }
  ]
});

export default models.Donation || model('Donation', DonationSchema);