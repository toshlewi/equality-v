import mongoose, { Schema, model, models } from 'mongoose';

const DonationSchema = new Schema({
  donorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, enum: ['cash', 'product', 'service', 'other'], required: true },
  amount: { type: Number },
  description: { type: String },
  paymentProvider: { type: String },
  paymentId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'collected'], default: 'pending' },
  notes: { type: String },
}, { timestamps: true });

export default models.Donation || model('Donation', DonationSchema);
