'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DonateFormProps {
  onClose: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function DonateForm({ onClose }: DonateFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    donationType: 'cash',
    amount: '',
    description: '',
    paymentMethod: 'stripe',
    notes: '',
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
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          .execute(siteKey, { action: 'donation' })
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
      // API expects: donorName, donorEmail, donorPhone, amount, donationType, category, paymentMethod, anonymous, message, termsAccepted, privacyAccepted, recaptchaToken
      
      // Amount is required for all donation types (API requirement)
      // For non-cash donations, we can use estimated value or 1 as minimum
      let amount = 1; // Default minimum for non-cash donations
      
      if (formData.donationType === 'cash') {
        if (!formData.amount) {
          throw new Error('Donation amount is required for cash donations');
        }
        amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Please enter a valid donation amount');
        }
      } else if (formData.amount) {
        // For non-cash, use provided estimated value if available
        amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
          amount = 1; // Fallback to minimum
        }
      }

      const payload: any = {
        donorName: formData.name,
        donorEmail: formData.email,
        donorPhone: formData.phone,
        amount: amount,
        donationType: formData.donationType === 'cash' ? 'cash' : formData.donationType === 'product' ? 'product' : 'service',
        category: 'general', // Default category, can be enhanced with a category field
        paymentMethod: formData.donationType === 'cash' ? formData.paymentMethod : 'stripe', // API requires stripe or mpesa, use stripe as default for non-cash
        anonymous: false, // Can be enhanced with a checkbox
        message: formData.notes || formData.description || undefined,
        termsAccepted: formData.acceptTerms,
        privacyAccepted: formData.acceptTerms,
        recaptchaToken: recaptchaToken
      };

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit donation');
      }

      setSuccess(true);
      
      // Handle payment if Stripe
      if (formData.donationType === 'cash' && formData.paymentMethod === 'stripe' && data.data?.clientSecret) {
        // Payment will be handled via Stripe client-side integration
        // For now, show success message
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // For M-Pesa or non-cash donations, just close after showing success
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      console.error('Donation form submission error:', err);
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
          Donate and Support Our Work
        </h2>
        <p className="text-gray-600 font-league-spartan">
          Help fund our initiatives and campaigns. Every contribution makes a difference.
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Enter your phone number"
          />
        </div>

        <div>
          <label htmlFor="donationType" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Type of Donation *
          </label>
          <select
            id="donationType"
            name="donationType"
            value={formData.donationType}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
          >
            <option value="cash">Cash Donation</option>
            <option value="product">Product Donation</option>
            <option value="service">Service Donation</option>
            <option value="other">Other</option>
          </select>
        </div>

        {formData.donationType === 'cash' && (
          <>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                 Donation Amount (KSh) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                 min="1000"
                 step="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
                 placeholder="Enter donation amount in KSh"
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                Payment Method *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
              >
                <option value="stripe">Credit/Debit Card (Stripe)</option>
                <option value="mpesa">M-Pesa</option>
              </select>
            </div>
          </>
        )}

        {(formData.donationType === 'product' || formData.donationType === 'service' || formData.donationType === 'other') && (
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
              placeholder="Describe what you're donating"
            />
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Any additional information or special instructions"
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
            className="mt-1 h-4 w-4 text-[#F9D960] focus:ring-[#F9D960] border-gray-300 rounded"
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
              Thank you for your donation! {formData.donationType === 'cash' ? 'Your payment will be processed shortly.' : 'We will contact you soon to arrange the donation.'}
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
            className="flex-1 px-6 py-3 bg-[#66623C] text-white rounded-lg hover:bg-[#66623C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
          >
            {isSubmitting ? 'Processing...' : success ? 'Submitted!' : 'Make Donation'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

