// Google Analytics 4 integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path: string;
  custom_parameters?: Record<string, any>;
}

/**
 * Initialize Google Analytics
 */
export function initializeAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  window.gtag = window.gtag || function() {
    (window.gtag.q = window.gtag.q || []).push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

/**
 * Track page view
 */
export function trackPageView(event: PageViewEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: event.page_title,
    page_location: event.page_location,
    page_path: event.page_path,
    ...event.custom_parameters
  });
}

/**
 * Track custom event
 */
export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', event.action, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.custom_parameters
  });
}

/**
 * Track form submission
 */
export function trackFormSubmission(formName: string, success: boolean = true) {
  trackEvent({
    action: 'form_submit',
    category: 'engagement',
    label: formName,
    custom_parameters: {
      success,
      form_name: formName
    }
  });
}

/**
 * Track payment completion
 */
export function trackPayment(paymentMethod: string, amount: number, currency: string = 'USD') {
  trackEvent({
    action: 'purchase',
    category: 'ecommerce',
    value: amount,
    custom_parameters: {
      payment_method: paymentMethod,
      currency,
      amount
    }
  });
}

/**
 * Track donation
 */
export function trackDonation(amount: number, donationType: string, category: string) {
  trackEvent({
    action: 'donate',
    category: 'engagement',
    value: amount,
    custom_parameters: {
      donation_type: donationType,
      donation_category: category,
      amount
    }
  });
}

/**
 * Track membership
 */
export function trackMembership(membershipType: string, amount: number) {
  trackEvent({
    action: 'membership',
    category: 'engagement',
    value: amount,
    custom_parameters: {
      membership_type: membershipType,
      amount
    }
  });
}

/**
 * Track content view
 */
export function trackContentView(contentType: string, contentId: string, contentTitle: string) {
  trackEvent({
    action: 'view_content',
    category: 'engagement',
    label: contentTitle,
    custom_parameters: {
      content_type: contentType,
      content_id: contentId,
      content_title: contentTitle
    }
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string, resultsCount: number) {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultsCount,
    custom_parameters: {
      search_term: searchTerm,
      results_count: resultsCount
    }
  });
}

/**
 * Track file download
 */
export function trackDownload(fileName: string, fileType: string) {
  trackEvent({
    action: 'file_download',
    category: 'engagement',
    label: fileName,
    custom_parameters: {
      file_name: fileName,
      file_type: fileType
    }
  });
}

/**
 * Track newsletter subscription
 */
export function trackNewsletterSubscription(source: string) {
  trackEvent({
    action: 'newsletter_subscribe',
    category: 'engagement',
    custom_parameters: {
      source
    }
  });
}

/**
 * Track admin action
 */
export function trackAdminAction(action: string, resource: string, adminId: string) {
  trackEvent({
    action: 'admin_action',
    category: 'admin',
    label: action,
    custom_parameters: {
      admin_action: action,
      resource,
      admin_id: adminId
    }
  });
}

/**
 * Track error
 */
export function trackError(error: string, errorType: string, page: string) {
  trackEvent({
    action: 'error',
    category: 'technical',
    label: error,
    custom_parameters: {
      error_type: errorType,
      page,
      error_message: error
    }
  });
}

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackFormSubmission,
  trackPayment,
  trackDonation,
  trackMembership,
  trackContentView,
  trackSearch,
  trackDownload,
  trackNewsletterSubscription,
  trackAdminAction,
  trackError
};
