import mongoose, { Schema, model, models } from 'mongoose';

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['general', 'partnership', 'volunteer', 'media', 'support', 'other'],
    default: 'general' 
  },
  status: { 
    type: String, 
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium' 
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  response: String,
  respondedAt: Date,
  respondedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  source: { 
    type: String, 
    enum: ['website', 'email', 'phone', 'social', 'other'],
    default: 'website' 
  },
  ipAddress: String,
  userAgent: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  notes: String,
  tags: [String],
  followUpDate: Date,
  isSpam: { type: Boolean, default: false }
}, { 
  timestamps: true,
  indexes: [
    { email: 1 },
    { status: 1 },
    { category: 1 },
    { createdAt: -1 },
    { assignedTo: 1 }
  ]
});

export default models.Contact || model('Contact', ContactSchema);