import mongoose, { Schema, model, models } from 'mongoose';

const AuditLogSchema = new Schema({
  // Event details
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'user_login',
      'user_logout', 
      'user_created',
      'user_updated',
      'user_deleted',
      'password_reset',
      'content_submitted',
      'content_approved',
      'content_rejected',
      'payment_processed',
      'payment_failed',
      'admin_action',
      'security_event',
      'api_access',
      'file_upload',
      'file_download',
      'email_sent',
      'system_error'
    ]
  },
  description: { type: String, required: true },
  
  // User information
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  userRole: { type: String },
  
  // Request details
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  requestMethod: { type: String },
  requestUrl: { type: String },
  
  // Event metadata
  metadata: { type: Schema.Types.Mixed, default: {} },
  
  // Security details
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low' 
  },
  isSecurityEvent: { type: Boolean, default: false },
  
  // Status
  status: { 
    type: String, 
    enum: ['success', 'failure', 'warning'], 
    default: 'success' 
  },
  
  // Timestamps
  timestamp: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) } // 1 year retention
}, { 
  timestamps: true,
  // TTL index for automatic cleanup
  indexes: [
    { expiresAt: 1, expireAfterSeconds: 0 }
  ]
});

// Additional indexes for performance
AuditLogSchema.index({ eventType: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ isSecurityEvent: 1, severity: 1, timestamp: -1 });

export default models.AuditLog || model('AuditLog', AuditLogSchema);