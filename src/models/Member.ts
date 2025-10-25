import mongoose, { Schema, model, models } from 'mongoose';

const MemberSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  membershipType: { 
    type: String, 
    enum: ['individual', 'student', 'organization', 'supporter'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'suspended', 'cancelled'],
    default: 'pending' 
  },
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['stripe', 'mpesa', 'bank_transfer'],
    default: 'stripe' 
  },
  paymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  organization: {
    name: String,
    type: String,
    website: String
  },
  interests: [String],
  newsletter: { type: Boolean, default: true },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String,
  lastLogin: Date,
  profileImage: String,
  documents: [{
    type: { type: String },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  indexes: [
    { email: 1 },
    { membershipType: 1, isActive: 1 },
    { status: 1 },
    { joinDate: -1 }
  ]
});

export default models.Member || model('Member', MemberSchema);