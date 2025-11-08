import { Schema, model, models } from 'mongoose';

const BookMeetingSchema = new Schema({
  book: { 
    type: Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  meetingDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  timezone: { type: String, default: 'UTC' },
  location: {
    name: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isVirtual: { type: Boolean, default: false },
    virtualLink: String,
    virtualPlatform: String
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  isPublic: { type: Boolean, default: true },
  capacity: { type: Number },
  registeredCount: { type: Number, default: 0 },
  waitlistCount: { type: Number, default: 0 },
  allowWaitlist: { type: Boolean, default: true },
  registrationDeadline: { type: Date },
  featuredImage: { type: String },
  images: [{ type: String }],
  // Discussion materials
  discussionQuestions: [{ type: String }],
  keyThemes: [{ type: String }],
  facilitator: {
    name: String,
    bio: String,
    image: String
  },
  // Meeting notes and outcomes
  meetingNotes: { type: String },
  keyTakeaways: [{ type: String }],
  participantFeedback: [{ type: String }],
  // Analytics
  attendanceCount: { type: Number, default: 0 },
  engagementScore: { type: Number, default: 0 },
  // Metadata
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { book: 1 },
    { meetingDate: 1 },
    { status: 1 },
    { isPublic: 1 },
    { 'location.city': 1 },
    { slug: 1 }
  ]
});

// Virtual for formatted meeting date
BookMeetingSchema.virtual('formattedMeetingDate').get(function() {
  return this.meetingDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for meeting duration
BookMeetingSchema.virtual('duration').get(function() {
  if (!this.startTime || !this.endTime) return null;
  
  const start = new Date(`2000-01-01T${this.startTime}`);
  const end = new Date(`2000-01-01T${this.endTime}`);
  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return `${diffHours} hours`;
});

// Virtual for registration status
BookMeetingSchema.virtual('registrationStatus').get(function() {
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'completed') return 'completed';
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return 'closed';
  if (this.capacity && this.registeredCount >= this.capacity) return 'full';
  return 'open';
});

export default models.BookMeeting || model('BookMeeting', BookMeetingSchema);
