import { Schema, model, models } from 'mongoose';

const SubmissionSchema = new Schema({
  type: { type: String, enum: ['blog', 'article', 'report'], required: true },
  submitterName: { type: String, required: true },
  submitterEmail: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  language: { type: String, required: true },
  tags: [{ type: String }],
  summary: { type: String },
  pdfUrl: { type: String, required: true },
  imageUrl: { type: String },
  consent: { type: Boolean, required: true },
  status: { type: String, enum: ['pending', 'in_review', 'approved', 'rejected', 'published'], default: 'pending' },
  reviewerId: { type: String },
  reviewNotes: { type: String },
}, { timestamps: true });

export default models.Submission || model('Submission', SubmissionSchema);
