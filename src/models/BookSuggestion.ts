import mongoose, { Schema, model, models } from 'mongoose';

const BookSuggestionSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  recommendedBy: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  reviewerId: { type: String },
  reviewNotes: { type: String },
}, { timestamps: true });

export default models.BookSuggestion || model('BookSuggestion', BookSuggestionSchema);
