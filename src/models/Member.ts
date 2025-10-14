import { Schema, model, models } from 'mongoose';

// Member model for community membership management
// Handles membership subscriptions, payments, and member data
const MemberSchema = new Schema({
  name: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, maxlength: 255 },
  phone: { type: String, required: true, maxlength: 20 },
  // Membership details
  membershipType: { 
    type: String, 
    enum: ['annual', 'lifetime', 'student', 'supporter'],
    required: true 
  },
  subscriptionStart: { type: Date, required: true },
  subscriptionEnd: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  // Payment information
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentProvider: { type: String, enum: ['stripe', 'mpesa', 'bank_transfer'] },
  paymentId: { type: String }, // Stripe payment intent ID or M-Pesa transaction ID
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  // Member profile
  profile: {
    bio: { type: String, maxlength: 500 },
    interests: [{ type: String }],
    location: { type: String },
    website: { type: String },
    socialLinks: {
      twitter: { type: String },
      linkedin: { type: String },
      instagram: { type: String }
    }
  },
  // Communication preferences
  newsletterSubscribed: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  // Mailchimp integration
  mailchimpId: { type: String },
  mailchimpTags: [{ type: String }],
  // Admin notes
  notes: { type: String, maxlength: 1000 },
  // Legal and consent
  termsAccepted: { type: Boolean, required: true },
  termsVersion: { type: String, required: true },
  privacyAccepted: { type: Boolean, required: true },
  privacyVersion: { type: String, required: true },
  // Activity tracking
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  // Referral system
  referredBy: { type: Schema.Types.ObjectId, ref: 'Member' },
  referralCode: { type: String, unique: true },
  referrals: [{ type: Schema.Types.ObjectId, ref: 'Member' }]
}, { 
  timestamps: true,
  indexes: [
    { email: 1 },
    { membershipType: 1, isActive: 1 },
    { paymentStatus: 1 },
    { subscriptionEnd: 1 },
    { referralCode: 1 }
  ]
});

// Pre-save middleware to generate referral code
MemberSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = `EV${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

// Virtual for membership status
MemberSchema.virtual('membershipStatus').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.subscriptionEnd < new Date()) return 'expired';
  if (this.paymentStatus === 'pending') return 'pending_payment';
  return 'active';
});

// Virtual for days until expiry
MemberSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.subscriptionEnd.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

export default models.Member || model('Member', MemberSchema);