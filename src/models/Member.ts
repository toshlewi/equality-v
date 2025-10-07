import mongoose, { Schema, model, models } from 'mongoose';

const MemberSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  tier: { type: String, required: true, default: '1year' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  paymentProvider: { type: String, required: true },
  paymentId: { type: String },
  status: { type: String, enum: ['pending', 'active', 'failed', 'cancelled'], default: 'pending' },
  mailchimpId: { type: String },
  acceptedTos: { type: Boolean, required: true },
  tosVersion: { type: String, required: true },
}, { timestamps: true });

export default models.Member || model('Member', MemberSchema);
