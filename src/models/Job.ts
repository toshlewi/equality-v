import mongoose, { Schema, model, models } from 'mongoose';

const JobSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 300 },
  department: { 
    type: String, 
    enum: ['advocacy', 'legal', 'communications', 'programs', 'operations', 'finance', 'other'],
    required: true 
  },
  type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship', 'volunteer'],
    required: true 
  },
  location: {
    type: String,
    enum: ['remote', 'hybrid', 'on-site'],
    required: true
  },
  locationDetails: {
    city: String,
    country: String,
    address: String
  },
  requirements: [String],
  responsibilities: [String],
  qualifications: [String],
  benefits: [String],
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
    isPublic: { type: Boolean, default: true }
  },
  status: { 
    type: String, 
    enum: ['draft', 'open', 'closed', 'filled'],
    default: 'draft' 
  },
  applicationDeadline: Date,
  startDate: Date,
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  applicationCount: { type: Number, default: 0 },
  applicationFormFields: [{
    name: String,
    label: String,
    type: { type: String, enum: ['text', 'email', 'phone', 'textarea', 'file', 'select'] },
    required: { type: Boolean, default: true },
    options: [String]
  }],
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { slug: 1 },
    { status: 1 },
    { type: 1 },
    { department: 1 },
    { isPublic: 1 },
    { title: 'text', description: 'text' }
  ]
});

export default models.Job || model('Job', JobSchema);

