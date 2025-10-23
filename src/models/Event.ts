import { Schema, model, models } from 'mongoose';

// Event model for events and registrations management
// Handles event creation, ticket types, and attendee management
const EventSchema = new Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, maxlength: 2000 },
  shortDescription: { type: String, maxlength: 300 },
  // Event details
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    isOnline: { type: Boolean, default: false },
    onlineLink: { type: String } // For virtual events
  },
  // Timing
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: { type: String, default: 'UTC' },
  // Capacity and tickets
  capacity: { type: Number, required: true },
  ticketTypes: [{
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    quantity: { type: Number, required: true },
    sold: { type: Number, default: 0 },
    isFree: { type: Boolean, default: false },
    memberDiscount: { type: Number, default: 0 }, // Percentage discount for members
    earlyBirdPrice: { type: Number },
    earlyBirdEndDate: { type: Date },
    isActive: { type: Boolean, default: true }
  }],
  // Event status
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  // Media and content
  coverImage: { type: String },
  gallery: [{ type: String }], // Array of image URLs
  // Event categories
  category: { 
    type: String, 
    enum: ['book_club', 'workshop', 'conference', 'meetup', 'fundraiser', 'other'],
    required: true 
  },
  tags: [{ type: String, maxlength: 50 }],
  // Registration settings
  registrationOpen: { type: Boolean, default: true },
  registrationStartDate: { type: Date },
  registrationEndDate: { type: Date },
  requireApproval: { type: Boolean, default: false },
  // Payment settings
  paymentRequired: { type: Boolean, default: true },
  paymentProviders: [{ type: String, enum: ['stripe', 'mpesa'] }],
  // Event management
  organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coOrganizers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Analytics
  viewCount: { type: Number, default: 0 },
  registrationCount: { type: Number, default: 0 },
  // SEO
  metaTitle: { type: String, maxlength: 60 },
  metaDescription: { type: String, maxlength: 160 },
  // Recurring events
  isRecurring: { type: Boolean, default: false },
  recurrencePattern: { type: String }, // daily, weekly, monthly, yearly
  recurrenceEndDate: { type: Date }
}, { 
  timestamps: true,
  indexes: [
    { status: 1, startDate: 1 },
    { category: 1, status: 1 },
    { tags: 1 },
    { slug: 1 },
    { organizerId: 1 },
    { registrationOpen: 1, status: 1 },
    { startDate: 1, status: 1 },
    { 'venue.city': 1, startDate: 1 },
    { 'venue.isOnline': 1, startDate: 1 },
    { createdAt: -1 }
  ]
});

// Pre-save middleware to generate slug
EventSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Virtual for total tickets sold
EventSchema.virtual('totalTicketsSold').get(function() {
  return this.ticketTypes.reduce((total, ticket) => total + ticket.sold, 0);
});

// Virtual for total revenue
EventSchema.virtual('totalRevenue').get(function() {
  return this.ticketTypes.reduce((total, ticket) => {
    return total + (ticket.sold * ticket.price);
  }, 0);
});

// Virtual for registration status
EventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (!this.registrationOpen) return 'closed';
  if (this.registrationStartDate && now < this.registrationStartDate) return 'not_open';
  if (this.registrationEndDate && now > this.registrationEndDate) return 'closed';
  return 'open';
});

export default models.Event || model('Event', EventSchema);