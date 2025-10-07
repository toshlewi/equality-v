import mongoose, { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'in_progress', 'resolved', 'closed'], default: 'new' },
  assignedTo: { type: String },
  response: { type: String },
  ticketId: { type: String, unique: true },
}, { timestamps: true });

export default models.Contact || model('Contact', ContactSchema);
