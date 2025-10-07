import mongoose, { Schema, model, models } from 'mongoose';

const PartnershipInquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String, required: true },
  method: { type: String, enum: ['funding', 'program_partnership', 'in_kind', 'other'], required: true },
  logoUrl: { type: String },
  activities: { type: String, required: true },
  alignment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'contacted', 'in_progress', 'declined'], default: 'pending' },
  reviewerId: { type: String },
  reviewNotes: { type: String },
}, { timestamps: true });

export default models.PartnershipInquiry || model('PartnershipInquiry', PartnershipInquirySchema);
