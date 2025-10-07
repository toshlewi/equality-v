import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'editor', 'reviewer', 'finance'], default: 'reviewer' },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  permissions: [{
    resource: { type: String, required: true },
    actions: [{ type: String, enum: ['create', 'read', 'update', 'delete'] }]
  }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
}, { timestamps: true });

export default models.User || model('User', UserSchema);
