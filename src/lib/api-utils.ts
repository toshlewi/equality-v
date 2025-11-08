import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { z } from 'zod';

// API Response utility functions
export class ApiResponse {
  static success(data: unknown, message?: string, status = 200) {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }, { status });
  }

  static error(message: string, status = 400, details?: unknown) {
    return NextResponse.json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    }, { status });
  }

  static unauthorized(message = 'Unauthorized access') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 401 });
  }

  static forbidden(message = 'Forbidden access') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 403 });
  }

  static notFound(message = 'Resource not found') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 404 });
  }

  static validationError(errors: Record<string, unknown> | Array<{ field: string; message: string }>) {
    // Convert array format to record format if needed
    const errorDetails = Array.isArray(errors)
      ? errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {} as Record<string, unknown>)
      : errors;
    
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 422 });
  }
}

// Authentication and authorization utilities
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return ApiResponse.unauthorized('Authentication required');
  }

  return { session, user: session.user };
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return the error response
  }

  const { user } = authResult;
  
  if (!user || !allowedRoles.includes(user.role)) {
    return ApiResponse.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
  }

  return authResult;
}

// Validation utilities
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): 
  | { success: true; data: T }
  | { success: false; errors: Array<{ field: string; message: string }> } {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] };
  }
}

// Pagination utilities
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 items per page
  const skip = (page - 1) * limit;
  
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder: 1 | -1 = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };
  
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';
  
  return {
    page,
    limit,
    skip,
    sort,
    filters: {
      search,
      status,
      category
    }
  };
}

// Database connection utility
export async function withDatabase<T>(
  operation: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Database operation failed' 
    };
  }
}

// Rate limiting utility (basic implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit = 100, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

// File upload validation
export function validateFileUpload(file: File, maxSize = 5 * 1024 * 1024, allowedTypes: string[] = []) {
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

// Common validation schemas
export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional()
  }),

  id: z.object({
    id: z.string().min(1, 'ID is required')
  }),

  status: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'published', 'draft', 'archived'])
  })
};
