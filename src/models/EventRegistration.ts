import mongoose, { Schema, model, models } from 'mongoose';

const EventRegistrationSchema = new Schema({
  eventId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  ticketType: { type: String, enum: ['free', 'paid', 'member_discount'], required: true },
  voucherCode: { type: String },
  paymentProvider: { type: String },
  paymentId: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'paid', 'cancelled', 'refunded'], default: 'pending' },
  notes: { type: String },
}, { timestamps: true });

export default models.EventRegistration || model('EventRegistration', EventRegistrationSchema);
