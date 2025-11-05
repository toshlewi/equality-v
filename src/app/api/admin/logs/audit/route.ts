import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { getAuditLogs } from '@/lib/audit';
import { getPaginationParams, ApiResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return ApiResponse.unauthorized('Authentication required');
    }

    if (!['admin'].includes(session.user.role)) {
      return ApiResponse.forbidden('Only admins can view audit logs');
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(request);

    // Build filters
    const filters: any = {
      limit,
      offset: skip
    };

    const eventType = searchParams.get('eventType');
    if (eventType) filters.eventType = eventType;

    const userId = searchParams.get('userId');
    if (userId) filters.userId = userId;

    const severity = searchParams.get('severity');
    if (severity) filters.severity = severity;

    const isSecurityEvent = searchParams.get('isSecurityEvent');
    if (isSecurityEvent === 'true') filters.isSecurityEvent = true;
    if (isSecurityEvent === 'false') filters.isSecurityEvent = false;

    const startDate = searchParams.get('startDate');
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get('endDate');
    if (endDate) filters.endDate = new Date(endDate);

    // Search in description
    const search = searchParams.get('search');
    if (search) {
      // We'll need to handle search in the query
      // For now, we'll pass it as metadata
      filters.search = search;
    }

    const result = await getAuditLogs(filters);

    if (!result.success) {
      return ApiResponse.error(
        'Failed to fetch audit logs',
        500,
        result.error || 'Unknown error'
      );
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil((result.total || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // If search is provided, filter logs by description
    let logs = result.logs || [];
    if (search) {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.description.toLowerCase().includes(searchLower) ||
        log.userEmail?.toLowerCase().includes(searchLower) ||
        log.ipAddress?.toLowerCase().includes(searchLower)
      );
    }

    return ApiResponse.success({
      logs,
      pagination: {
        page,
        limit,
        total: result.total || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return ApiResponse.error(
      'Failed to fetch audit logs',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

