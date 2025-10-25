"use client";

import { useCallback } from 'react';

export const useRecaptcha = () => {
  const executeRecaptcha = useCallback(async (action: string = 'submit'): Promise<string | null> => {
    if (typeof window === 'undefined' || !window.grecaptcha) {
      console.warn('reCAPTCHA not loaded');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action }
      );
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  }, []);

  const verifyRecaptcha = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recaptchaToken: token }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('reCAPTCHA verification failed:', error);
      return false;
    }
  }, []);

  return {
    executeRecaptcha,
    verifyRecaptcha,
  };
};

// Export as default as well
export default useRecaptcha;
