import { Schema, model, models } from 'mongoose';

// Notification model for in-app notifications and email triggers
// Handles both user-specific and global notifications
const NotificationSchema = new Schema({
  // Recipient information
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, // null for global notifications
  isGlobal: { type: Boolean, default: false },
  // Notification content
  type: { 
    type: String, 
    enum: [
      'new_submission', 'submission_approved', 'submission_rejected',
      'new_payment', 'payment_failed', 'payment_refunded',
      'new_member', 'member_expired',
      'new_order', 'order_shipped', 'order_delivered',
      'new_registration', 'event_cancelled',
      'new_donation', 'donation_acknowledged',
      'system_alert', 'maintenance', 'feature_update'
    ],
    required: true 
  },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  // Notification status
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  // Action and metadata
  actionUrl: { type: String }, // URL to navigate to when clicked
  actionText: { type: String }, // Text for action button
  metadata: { type: Schema.Types.Mixed }, // Additional data for the notification
  // Priority and categorization
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: { 
    type: String, 
    enum: ['content', 'payment', 'member', 'order', 'event', 'donation', 'system'],
    required: true 
  },
  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  // Email delivery
  emailSent: { type: Boolean, default: false },
  emailSentAt: { type: Date },
  emailTemplate: { type: String },
  // SMS delivery
  smsSent: { type: Boolean, default: false },
  smsSentAt: { type: Date },
  // Push notification
  pushSent: { type: Boolean, default: false },
  pushSentAt: { type: Date },
  // Expiration
  expiresAt: { type: Date },
  // Related entities
  relatedEntity: {
    type: { type: String }, // 'article', 'member', 'order', 'event', etc.
    id: { type: Schema.Types.ObjectId }
  },
  // Creator information
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  // Batch notifications (for bulk operations)
  batchId: { type: String },
  isBatch: { type: Boolean, default: false },
  // Dismissal
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date },
  dismissedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: true,
  indexes: [
    { userId: 1, read: 1, createdAt: -1 },
    { isGlobal: 1, read: 1, createdAt: -1 },
    { type: 1, createdAt: -1 },
    { category: 1, priority: 1 },
    { expiresAt: 1 },
    { batchId: 1 }
  ]
});

// Virtual for time since creation
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Virtual for priority color
NotificationSchema.virtual('priorityColor').get(function() {
  const colorMap = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  };
  return colorMap[this.priority] || 'blue';
});

// Static method to create notification
NotificationSchema.statics.createNotification = function(data) {
  return this.create({
    ...data,
    createdAt: new Date()
  });
};

// Static method to mark as read
NotificationSchema.statics.markAsRead = function(notificationId, _userId) {
  return this.findByIdAndUpdate(notificationId, {
    read: true,
    readAt: new Date()
  }, { new: true });
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    $and: [
      {
        $or: [
          { userId: userId, read: false },
          { isGlobal: true, read: false }
        ]
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ]
      }
    ],
    dismissed: false
  });
};

export default models.Notification || model('Notification', NotificationSchema);
