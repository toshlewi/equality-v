import { Schema, model, models } from 'mongoose';

// BookSuggestion model for ALKAH Book Club recommendations
// Simple model for book suggestions from community members
const BookSuggestionSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  author: { type: String, required: true, maxlength: 100 },
  recommendedBy: { type: String, required: true, maxlength: 100 },
  submitterContact: { type: String }, // Email or phone for follow-up
  notes: { type: String, maxlength: 1000 }, // Why they recommend this book
  // Book details (can be filled by admin)
  isbn: { type: String },
  publisher: { type: String },
  publicationYear: { type: Number },
  coverImageUrl: { type: String },
  description: { type: String },
  // Categories and tags
  categories: [{ type: String }], // feminist, legal, african, etc.
  tags: [{ type: String, maxlength: 50 }],
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'accepted', 'rejected', 'added_to_library'],
    default: 'pending'
  },
  // Review details
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  reviewedAt: { type: Date },
  // Library integration
  addedToLibrary: { type: Boolean, default: false },
  libraryId: { type: Schema.Types.ObjectId, ref: 'Book' }, // Link to Book model if added
  // Book club integration
  bookClubMeeting: {
    scheduledDate: { type: Date },
    meetingId: { type: Schema.Types.ObjectId, ref: 'BookClubMeeting' }
  }
}, { 
  timestamps: true,
  indexes: [
    { status: 1, createdAt: -1 },
    { categories: 1 },
    { tags: 1 },
    { addedToLibrary: 1 }
  ]
});

// Virtual for formatted creation date
BookSuggestionSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

export default models.BookSuggestion || model('BookSuggestion', BookSuggestionSchema);