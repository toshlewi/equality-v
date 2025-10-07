import mongoose, { Schema, model, models } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, default: 0 },
  imageUrl: { type: String },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  maxAttendees: { type: Number },
  registrationDeadline: { type: Date },
  tags: [{ type: String }],
  organizer: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
}, { timestamps: true });

export default models.Event || model('Event', EventSchema);
