import { Schema, model, models } from 'mongoose';

const TagSchema = new Schema({
  name: { type: String, required: true, unique: true, maxlength: 50 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, maxlength: 200 },
  color: { type: String, default: '#6B7280' },
  category: { type: String, default: 'general' },
  isActive: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 },
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { name: 1 },
    { slug: 1 },
    { category: 1 },
    { isActive: 1 },
    { usageCount: -1 }
  ]
});

// Virtual for formatted name
TagSchema.virtual('formattedName').get(function() {
  return this.name.charAt(0).toUpperCase() + this.name.slice(1);
});

export default models.Tag || model('Tag', TagSchema);
