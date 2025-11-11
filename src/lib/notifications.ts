import { connectDB } from './mongodb';
import Notification from '@/models/Notification';

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  actionUrl?: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  status?: 'unread' | 'read';
  priority?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Create a new notification
 */
export async function createNotification(data: NotificationData): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    await connectDB();

    const notification = new Notification({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      category: data.category || 'general',
      actionUrl: data.actionUrl,
      read: false,
      channels: {
        inApp: true,
        email: false,
        sms: false,
        push: false
      }
    });

    await notification.save();

    // TODO: Send real-time notification via WebSocket
    // TODO: Send email notification if configured

    return {
      success: true,
      notificationId: notification._id.toString()
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get notifications for a user
 */
export async function getNotifications(filters: NotificationFilters): Promise<{ success: boolean; notifications?: any[]; total?: number; error?: string }> {
  try {
    await connectDB();

    const query: any = {};
    
    if (filters.userId) query.userId = filters.userId;
    if (filters.type) query.type = filters.type;
    if (filters.status) query.read = filters.status === 'read';
    if (filters.priority) query.priority = filters.priority;
    if (filters.category) query.category = filters.category;

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'name email role');

    const total = await Notification.countDocuments(query);

    return {
      success: true,
      notifications: notifications.map(notification => ({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        message: notification.message,
        status: notification.read ? 'read' : 'unread',
        priority: notification.priority,
        category: notification.category,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
        readAt: notification.readAt
      })),
      total
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        userId: userId 
      },
      { 
        read: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return {
        success: false,
        error: 'Notification not found'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    await Notification.updateMany(
      { 
        userId: userId,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: userId
    });

    if (!notification) {
      return {
        success: false,
        error: 'Notification not found'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId: string): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await connectDB();

    const count = await Notification.countDocuments({
      userId: userId,
      read: false
    });

    return {
      success: true,
      count
    };
  } catch (error) {
    console.error('Error getting unread count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create notification for admin users
 */
export async function createAdminNotification(data: Omit<NotificationData, 'userId'>): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Get all admin users
    const User = (await import('@/models/User')).default;
    const adminUsers = await User.find({
      role: { $in: ['admin', 'editor'] },
      isActive: true
    });

    // Create notification for each admin
    const notifications = adminUsers.map(admin => ({
      userId: admin._id,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      category: data.category || 'admin',
      actionUrl: data.actionUrl,
      read: false,
      channels: {
        inApp: true,
        email: true,
        sms: false,
        push: false
      }
    }));

    await Notification.insertMany(notifications);

    return { success: true };
  } catch (error) {
    console.error('Error creating admin notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create notification for specific user roles
 */
export async function createRoleNotification(
  roles: string[], 
  data: Omit<NotificationData, 'userId'>
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Get users with specified roles
    const User = (await import('@/models/User')).default;
    const users = await User.find({
      role: { $in: roles },
      isActive: true
    });

    // Create notification for each user
    const notifications = users.map(user => ({
      userId: user._id,
      type: data.type,
      title: data.title,
      message: data.message,
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      category: data.category || 'general',
      actionUrl: data.actionUrl,
      read: false,
      channels: {
        inApp: true,
        email: false,
        sms: false,
        push: false
      }
    }));

    await Notification.insertMany(notifications);

    return { success: true };
  } catch (error) {
    console.error('Error creating role notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up old notifications
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });

    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error('Error cleaning up old notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Create notification for admin users (alias for createAdminNotification)
export const createAdminNotificationForAll = async (data: Omit<NotificationData, 'userId'>): Promise<{ success: boolean; error?: string }> => {
  return createAdminNotification(data);
};

export default {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createAdminNotification,
  createRoleNotification,
  cleanupOldNotifications
};
