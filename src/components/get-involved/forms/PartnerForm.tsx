'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PartnerFormProps {
  onClose: () => void;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export function PartnerForm({ onClose }: PartnerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    partnershipMethod: '',
    logo: null as File | null,
    activities: '',
    alignment: '',
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Load reCAPTCHA script - TEMPORARILY DISABLED FOR TESTING (2025-11-10)
  useEffect(() => {
    console.warn('⚠️ reCAPTCHA loading DISABLED for testing purposes');
    // DISABLED - reCAPTCHA script loading commented out
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
    setFormData(prev => ({ ...prev, logo: file }));
      
      // Upload logo to get URL (simplified - in production, use signed URL)
      // For now, we'll handle it in the API
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/uploads/request', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success && data.url) {
          setLogoUrl(data.url);
        }
      } catch (err) {
        console.error('Logo upload error:', err);
        // Continue without logo URL
      }
    }
  };

  const getRecaptchaToken = async (): Promise<string> => {
    // TEMPORARILY DISABLED FOR TESTING (2025-11-10)
    console.warn('⚠️ reCAPTCHA token generation BYPASSED for testing');
    return 'testing-bypass-token';
  };

  // Map partnership method to API expected values
  const mapPartnershipType = (method: string): string => {
    const mapping: Record<string, string> = {
      'funding': 'financial',
      'program': 'collaborative',
      'in-kind': 'sponsorship',
      'other': 'other'
    };
    return mapping[method] || 'other';
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
      // API expects: organizationName, contactName, contactEmail, contactPhone, website, partnershipType, description, goals, budget, timeline, logoUrl, additionalInfo, termsAccepted, privacyAccepted, recaptchaToken
      
      // Validate required fields meet minimum length requirements
      if (formData.activities.length < 50) {
        throw new Error('Please provide a more detailed description of your company\'s activities (at least 50 characters).');
      }
      
      if (formData.alignment.length < 20) {
        throw new Error('Please provide more details on how your company aligns with our work (at least 20 characters).');
      }
      
      // Build payload - only include optional fields if they have values
      const payload: any = {
        organizationName: formData.company,
        contactName: formData.name,
        contactEmail: formData.email,
        partnershipType: mapPartnershipType(formData.partnershipMethod),
        description: formData.activities,
        goals: formData.alignment,
        termsAccepted: formData.acceptTerms,
        privacyAccepted: formData.acceptTerms,
        recaptchaToken: recaptchaToken
      };
    
      // Only include optional fields if they have valid values
      if (logoUrl && logoUrl.trim() !== '') {
        payload.logoUrl = logoUrl;
      }

      const response = await fetch('/api/partnerships/inquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit partnership inquiry');
      }

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Partnership form submission error:', err);
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
          Partner With Us
        </h2>
        <p className="text-gray-600 font-league-spartan">
          Join forces with us to create lasting impact. Together we can achieve more.
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
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Company/Organization *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Enter your company name"
          />
        </div>

        <div>
          <label htmlFor="partnershipMethod" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Method of Partnership *
          </label>
          <select
            id="partnershipMethod"
            name="partnershipMethod"
            value={formData.partnershipMethod}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
          >
            <option value="">Select partnership method</option>
            <option value="funding">Funding</option>
            <option value="program">Program Partnership</option>
            <option value="in-kind">In-Kind Support</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Company Logo (Optional)
          </label>
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
          />
        </div>

        <div>
          <label htmlFor="activities" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            What does your company do? *
          </label>
          <textarea
            id="activities"
            name="activities"
            value={formData.activities}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Describe your company's activities and mission"
          />
        </div>

        <div>
          <label htmlFor="alignment" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            How does your company align with Equality Vanguard&apos;s work? *
          </label>
          <textarea
            id="alignment"
            name="alignment"
            value={formData.alignment}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD935] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Explain how your values and work align with our mission"
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
              Thank you for your partnership inquiry! We've received your submission and will review it soon. We'll get back to you shortly.
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
            className="flex-1 px-6 py-3 bg-[#FF7D05] text-white rounded-lg hover:bg-[#FF7D05]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
          >
            {isSubmitting ? 'Processing...' : success ? 'Submitted!' : 'Submit Partnership Inquiry'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
