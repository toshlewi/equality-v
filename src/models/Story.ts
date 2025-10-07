import mongoose, { Schema, model, models } from 'mongoose';

const StorySchema = new Schema({
  submitterName: { type: String },
  submitterEmail: { type: String },
  submitterPhone: { type: String },
  anonymous: { type: Boolean, default: false },
  title: { type: String, required: true },
  tags: [{ type: String }],
  text: { type: String },
  files: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'audio', 'pdf'], required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true }
  }],
  consent: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected', 'published'], default: 'pending' },
  reviewerId: { type: String },
  reviewNotes: { type: String },
}, { timestamps: true });

export default models.Story || model('Story', StorySchema);
