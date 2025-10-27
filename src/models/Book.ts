import mongoose, { Schema, model, models } from 'mongoose';

const BookSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  genre: { type: String },
  year: { type: Number },
  coverUrl: { type: String }, // renamed from coverImage
  isbn: { type: String, unique: true, sparse: true },
  description: { type: String, maxlength: 1000 },
  shortDescription: { type: String, maxlength: 300 },
  publisher: { type: String },
  language: { type: String, default: 'English' },
  pages: { type: Number },
  category: { 
    type: String, 
    enum: ['fiction', 'non-fiction', 'poetry', 'essays', 'memoir', 'academic', 'other'],
    default: 'non-fiction'
  },
  tags: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isInLibrary: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['pending', 'review', 'published', 'rejected'], 
    default: 'pending' 
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  // Book club specific fields
  isBookClubSelection: { type: Boolean, default: false },
  bookClubDate: { type: Date },
  discussionNotes: { type: String },
  // SEO fields
  seoTitle: String,
  seoDescription: String,
  // Submission metadata
  submittedByName: { type: String },
  submittedByEmail: { type: String },
  submittedByPhone: { type: String },
  submittedByOrganization: { type: String },
  submittedByRole: { type: String },
  submissionDate: { type: Date },
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { title: 'text', author: 'text', description: 'text' },
    { slug: 1 },
    { isbn: 1 },
    { author: 1 },
    { category: 1 },
    { isFeatured: 1, status: 1 },
    { isBookClubSelection: 1, bookClubDate: -1 },
    { status: 1, isInLibrary: 1 }
  ]
});

// Virtual for formatted book club date
BookSchema.virtual('formattedBookClubDate').get(function() {
  if (!this.bookClubDate) return null;
  return this.bookClubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for average rating
BookSchema.virtual('averageRating').get(function() {
  return this.reviewCount > 0 ? (this.rating / this.reviewCount).toFixed(1) : 0;
});

export default models.Book || model('Book', BookSchema);
