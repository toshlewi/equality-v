import { Schema, model, models } from 'mongoose';

const EventSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: String,
  endTime: String,
  timezone: { type: String, default: 'UTC' },
  location: {
    name: String,
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
  category: { 
    type: String, 
    enum: ['workshop', 'conference', 'meeting', 'social', 'fundraiser', 'other'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft' 
  },
  isPublic: { type: Boolean, default: true },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  ticketInfo: {
    accessCode: { type: String },
    hasDiscounts: { type: Boolean, default: false },
    discountCodes: [{
      code: { type: String },
      amountOff: { type: Number, default: 0 },
      percentOff: { type: Number, default: 0 },
      expiresAt: { type: Date }
    }]
  },
  capacity: Number,
  registeredCount: { type: Number, default: 0 },
  waitlistCount: { type: Number, default: 0 },
  allowWaitlist: { type: Boolean, default: true },
  registrationDeadline: Date,
  featuredImage: String,
  images: [String],
  bannerImage: String,
  // Controls inclusion and order in Past Events carousel
  showInPastCarousel: { type: Boolean, default: false },
  pastCarouselOrder: { type: Number, default: 0 },
  tags: [String],
  organizer: {
    name: String,
    email: String,
    phone: String
  },
  registration: {
    type: {
      type: String,
      enum: ['form', 'external'],
      default: 'form'
    },
    externalLink: String,
    formFields: [{
      name: String,
      label: String,
      type: { type: String, enum: ['text', 'email', 'phone', 'select', 'textarea'] },
      required: { type: Boolean, default: true },
      options: [String]
    }]
  },
  requirements: [String],
  whatToBring: [String],
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  speakers: [{
    name: String,
    bio: String,
    image: String,
    title: String,
    organization: String
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    level: String
  }],
  recap: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ['gallery', 'video'], default: 'gallery' },
    galleryImages: [String],
    videoUrl: String,
    summary: String
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  googleCalendarEventId: String, // Google Calendar event ID for sync
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { slug: 1 },
    { status: 1 },
    { startDate: 1 },
    { category: 1 },
    { isPublic: 1 },
    { title: 'text', description: 'text' }
  ]
});

export default models.Event || model('Event', EventSchema);