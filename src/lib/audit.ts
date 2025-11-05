import { connectDB } from './mongodb';
import AuditLog from '@/models/AuditLog';

export interface AuditLogData {
  eventType: string;
  description: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  metadata?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isSecurityEvent?: boolean;
  status?: 'success' | 'failure' | 'warning';
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    await connectDB();

    const auditLog = new AuditLog({
      eventType: data.eventType,
      description: data.description,
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestMethod: data.requestMethod,
      requestUrl: data.requestUrl,
      metadata: data.metadata || {},
      severity: data.severity || 'low',
      isSecurityEvent: data.isSecurityEvent || false,
      status: data.status || 'success',
      timestamp: new Date()
    });

    await auditLog.save();

    return {
      success: true,
      logId: auditLog._id.toString()
    };
  } catch (error) {
    console.error('Error creating audit log:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  eventType?: string;
  userId?: string;
  severity?: string;
  isSecurityEvent?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; logs?: any[]; total?: number; error?: string }> {
  try {
    await connectDB();

    const query: any = {};
    
    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.userId) query.userId = filters.userId;
    if (filters.severity) query.severity = filters.severity;
    if (filters.isSecurityEvent !== undefined) query.isSecurityEvent = filters.isSecurityEvent;
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(offset)
      .populate('userId', 'name email role')
      .lean();

    const total = await AuditLog.countDocuments(query);

    return {
      success: true,
      logs: logs.map(log => ({
        id: log._id.toString(),
        eventType: log.eventType,
        description: log.description,
        userId: log.userId ? (typeof log.userId === 'object' ? log.userId._id.toString() : log.userId.toString()) : null,
        userEmail: log.userEmail,
        userRole: log.userRole,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        requestMethod: log.requestMethod,
        requestUrl: log.requestUrl,
        metadata: log.metadata || {},
        severity: log.severity,
        isSecurityEvent: log.isSecurityEvent,
        status: log.status,
        timestamp: log.timestamp,
        createdAt: log.createdAt
      })),
      total
    };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

