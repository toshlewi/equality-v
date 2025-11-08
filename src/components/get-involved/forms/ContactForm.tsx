'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ContactFormProps {
  onClose: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function ContactForm({ onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load reCAPTCHA script
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (typeof window !== 'undefined' && !window.grecaptcha && siteKey && siteKey !== 'your_recaptcha_site_key' && siteKey.trim() !== '') {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
        setError('Security verification failed to load. Please refresh the page.');
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const getRecaptchaToken = async (): Promise<string> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    // If reCAPTCHA is not configured, return a placeholder token (for development)
    // The server will handle validation and allow requests if reCAPTCHA is not configured
    if (!siteKey || siteKey === 'your_recaptcha_site_key' || siteKey.trim() === '') {
      console.warn('reCAPTCHA not configured. Using placeholder token for development.');
      return 'dev-placeholder-token';
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.grecaptcha) {
        // If reCAPTCHA script hasn't loaded, return placeholder
        console.warn('reCAPTCHA script not loaded. Using placeholder token.');
        resolve('dev-placeholder-token');
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action: 'contact' })
          .then((token: string) => {
            resolve(token);
          })
          .catch((err: Error) => {
            console.error('reCAPTCHA execution error:', err);
            // For development, allow form submission even if reCAPTCHA fails
            resolve('dev-placeholder-token');
          });
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      // Map form fields to API schema
      // API expects: name, email, phone (optional), subject, message, category, recaptchaToken
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
        category: 'general' as const, // Default category, can be enhanced with a category field
        recaptchaToken: recaptchaToken
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit contact form');
      }

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Contact form submission error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
    setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#042C45] mb-4 font-fredoka">
          Contact Us
        </h2>
        <p className="text-gray-600 font-league-spartan">
            Have questions or ideas? We&apos;d love to hear from you. Let&apos;s start a conversation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="What is this about?"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Tell us more about your inquiry, suggestion, or question"
          />
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="acceptTerms"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            required
            className="mt-1 h-4 w-4 text-[#FFD935] focus:ring-[#FFD935] border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-600 font-league-spartan">
            I accept the Terms and Conditions and Privacy Policy *
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-league-spartan">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm font-league-spartan">
              Thank you for contacting us! Your message has been received and we'll get back to you soon.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-league-spartan disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.acceptTerms || success}
            className="flex-1 px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
          >
            {isSubmitting ? 'Sending...' : success ? 'Sent!' : 'Send Message'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
