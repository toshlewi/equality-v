import { NextRequest, NextResponse } from 'next/server';
// import { headers } from 'next/headers'; // Unused for now
import AuditLog from '@/models/AuditLog';
import connectDB from '@/lib/mongodb';

// Security headers middleware
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com https://api.mpesa.vm.co.ke; " +
    "frame-src 'self' https://js.stripe.com; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  
  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

// Request validation middleware
export function validateRequest(request: NextRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for suspicious patterns
  const userAgent = request.headers.get('user-agent') || '';
  if (userAgent.length < 10) {
    errors.push('Invalid user agent');
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
  for (const header of suspiciousHeaders) {
    const value = request.headers.get(header);
    if (value && value.includes('..')) {
      errors.push(`Suspicious header: ${header}`);
    }
  }
  
  // Check for SQL injection patterns
  const url = request.url;
  const sqlPatterns = [
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
    /or\s+1=1/i,
    /and\s+1=1/i
  ];
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(url)) {
      errors.push('Potential SQL injection attempt');
      break;
    }
  }
  
  // Check for XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  for (const pattern of xssPatterns) {
    if (pattern.test(url)) {
      errors.push('Potential XSS attempt');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Audit logging middleware
export async function logSecurityEvent(event: {
  eventType: string;
  description: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
  requestMethod?: string;
  requestUrl?: string;
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  isSecurityEvent?: boolean;
  status?: 'success' | 'failure' | 'warning';
}) {
  try {
    await connectDB();
    
    const auditLog = new AuditLog({
      ...event,
      timestamp: new Date()
    });
    
    await auditLog.save();
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// IP blocking middleware
export function isBlockedIP(ip: string): boolean {
  // In production, this would check against a database of blocked IPs
  // or a service like Cloudflare's IP reputation database
  const blockedIPs = [
    '127.0.0.1', // Example blocked IP
    // Add more blocked IPs as needed
  ];
  return blockedIPs.includes(ip);
}

// Request sanitization
export function sanitizeRequest(request: NextRequest): NextRequest {
  // This is a simplified example - in practice, you'd sanitize
  // query parameters, headers, and body data
  return request;
}

// Security middleware wrapper
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check if IP is blocked
    if (isBlockedIP(ip)) {
      await logSecurityEvent({
        eventType: 'security_event',
        description: 'Blocked IP attempt',
        ipAddress: ip,
        userAgent,
        severity: 'high',
        isSecurityEvent: true,
        status: 'failure'
      });
      
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Validate request
    const validation = validateRequest(request);
    if (!validation.isValid) {
      await logSecurityEvent({
        eventType: 'security_event',
        description: `Suspicious request: ${validation.errors.join(', ')}`,
        ipAddress: ip,
        userAgent,
        requestMethod: request.method,
        requestUrl: request.url,
        severity: 'medium',
        isSecurityEvent: true,
        status: 'failure'
      });
      
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }
    
    // Sanitize request
    const sanitizedRequest = sanitizeRequest(request);
    
    // Call the original handler
    const response = await handler(sanitizedRequest);
    
    // Add security headers
    return addSecurityHeaders(response);
  };
}

// Helmet middleware (alias for addSecurityHeaders)
export const helmet = addSecurityHeaders;

// CORS middleware (placeholder)
export const cors = (_options: any) => (request: NextRequest) => request;

export default {
  addSecurityHeaders,
  validateRequest,
  logSecurityEvent,
  isBlockedIP,
  sanitizeRequest,
  withSecurity,
  helmet,
  cors,
};
