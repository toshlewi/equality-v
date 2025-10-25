import mongoose, { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, maxlength: 500 },
  color: { type: String, default: '#6B7280' },
  icon: { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { slug: 1 },
    { isActive: 1 },
    { parent: 1 },
    { sortOrder: 1 }
  ]
});

// Virtual for content count
CategorySchema.virtual('contentCount').get(function() {
  // This would be populated by a separate query
  return 0;
});

export default models.Category || model('Category', CategorySchema);
