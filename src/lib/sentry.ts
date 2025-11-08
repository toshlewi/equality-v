import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
export function initSentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring
      tracesSampleRate: 0.1,
      
      // Set profilesSampleRate to 1.0 to profile every transaction
      profilesSampleRate: 0.1,
      
      // Note: captureUnhandledRejections and captureUncaughtException are not available in @sentry/nextjs v10+
      // Unhandled rejections and exceptions are captured automatically
      
      // Set beforeSend to filter sensitive data
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        // Filter out sensitive headers
        if (event.request?.headers) {
          const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
          sensitiveHeaders.forEach(header => {
            if (event.request?.headers?.[header]) {
              event.request.headers[header] = '[Filtered]';
            }
          });
        }
        
        // Filter out sensitive user data
        if (event.user) {
          delete event.user.email;
          delete event.user.ip_address;
        }
        
        return event;
      },
      
      // Set beforeSendTransaction to filter sensitive data in transactions
      beforeSendTransaction(event) {
        // Filter out sensitive data from transactions
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        
        return event;
      },
      
      // Set integrations (Sentry v10+ uses different integration API)
      integrations: [],
      
      // Set release
      release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      
      // Set server name
      serverName: process.env.VERCEL_URL || 'localhost',
    });
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context
    });
  } else {
    console.error('Exception:', error, context);
  }
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, {
      level,
      extra: context
    });
  } else {
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(message: string, category: string, level: Sentry.SeverityLevel = 'info', data?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data
    });
  } else {
    console.log(`[BREADCRUMB] ${category}: ${message}`, data);
  }
}

/**
 * Set user context
 */
export function setUserContext(user: { id: string; email?: string; role?: string }) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role
    });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setUser(null);
  }
}

/**
 * Set tags
 */
export function setTags(tags: Record<string, string>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setTags(tags);
  }
}

/**
 * Set context
 */
export function setContext(key: string, context: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.setContext(key, context);
  }
}

/**
 * Start transaction (using startSpan in Sentry v10+)
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NODE_ENV === 'production') {
    return Sentry.startSpan({ name, op }, () => {
      // Transaction logic here
      return null;
    });
  }
  return null;
}

/**
 * Capture API error
 */
export function captureApiError(error: Error, request: { method: string; url: string; headers?: Record<string, string> }, context?: Record<string, any>) {
  captureException(error, {
    ...context,
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers
    }
  });
}

/**
 * Capture database error
 */
export function captureDatabaseError(error: Error, operation: string, collection?: string, context?: Record<string, any>) {
  captureException(error, {
    ...context,
    database: {
      operation,
      collection
    }
  });
}

/**
 * Capture payment error
 */
export function capturePaymentError(error: Error, paymentMethod: string, amount?: number, context?: Record<string, any>) {
  captureException(error, {
    ...context,
    payment: {
      method: paymentMethod,
      amount
    }
  });
}

/**
 * Capture email error
 */
export function captureEmailError(error: Error, template: string, recipient: string, context?: Record<string, any>) {
  captureException(error, {
    ...context,
    email: {
      template,
      recipient
    }
  });
}

export default {
  initSentry,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  setTags,
  setContext,
  startTransaction,
  captureApiError,
  captureDatabaseError,
  capturePaymentError,
  captureEmailError
};
