import { Schema, model, models } from 'mongoose';

// Book model for Alkah Library
const BookSchema = new Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: 300,
    trim: true
  },
  author: { 
    type: String, 
    required: true,
    maxlength: 200,
    trim: true
  },
  year: { 
    type: Number,
    min: 1800,
    max: new Date().getFullYear() + 1
  },
  summary: { 
    type: String,
    maxlength: 2000,
    trim: true
  },
  category: { 
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Biography', 'Poetry', 'Academic', 'Children', 'Other'],
    default: 'Fiction'
  },
  // New field for MatriArchive categorization
  matriarchiveCategory: {
    type: String,
    enum: ['Covered', 'Library'],
    default: 'Library'
  },
  genre: [{
    type: String,
    maxlength: 50,
    trim: true
  }],
  coverImage: {
    url: { type: String },
    alt: { type: String }
  },
  // Book club meeting details
  meetingDate: { 
    type: Date 
  },
  meetingLocation: {
    type: String,
    maxlength: 200
  },
  meetingNotes: {
    type: String,
    maxlength: 2000
  },
  discussionHighlights: [{
    topic: String,
    notes: String,
    timestamp: Date
  }],
  // Status for moderation
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Featured book flag
  featured: { 
    type: Boolean, 
    default: false 
  },
  // Book suggestion details
  suggestedBy: {
    name: String,
    email: String,
    reason: String
  },
  // Additional metadata
  isbn: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    maxlength: 200
  },
  language: {
    type: String,
    default: 'English'
  },
  pageCount: {
    type: Number,
    min: 1
  },
  // Tags for search and categorization
  tags: [{
    type: String,
    maxlength: 50,
    trim: true
  }],
  // Analytics
  viewCount: { 
    type: Number, 
    default: 0 
  },
  // Related books
  relatedBooks: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }]
}, { 
  timestamps: true,
  // Add indexes for performance
  indexes: [
    { status: 1, createdAt: -1 },
    { category: 1, status: 1 },
    { author: 1 },
    { year: -1 },
    { featured: 1, status: 1 },
    { tags: 1 },
    { meetingDate: -1 }
  ]
});

// Virtual for formatted publication year
BookSchema.virtual('formattedYear').get(function() {
  return this.year ? this.year.toString() : 'Unknown';
});

// Virtual for formatted meeting date
BookSchema.virtual('formattedMeetingDate').get(function() {
  if (!this.meetingDate) return null;
  return this.meetingDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to increment view count
BookSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get approved books
BookSchema.statics.getApproved = function() {
  return this.find({ status: 'approved' }).sort({ createdAt: -1 });
};

// Static method to get featured books
BookSchema.statics.getFeatured = function() {
  return this.find({ status: 'approved', featured: true }).sort({ createdAt: -1 });
};

// Static method to get books by category
BookSchema.statics.getByCategory = function(category) {
  return this.find({ status: 'approved', category }).sort({ createdAt: -1 });
};

// Static method to get upcoming book club meetings
BookSchema.statics.getUpcomingMeetings = function() {
  return this.find({ 
    status: 'approved', 
    meetingDate: { $gte: new Date() } 
  }).sort({ meetingDate: 1 });
};

export default models.Book || model('Book', BookSchema);
