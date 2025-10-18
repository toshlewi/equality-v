'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PartnerFormProps {
  onClose: () => void;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, logo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Connect this form to /api/forms/partnership
    // TODO: Store submissions in MongoDB (collection: "partnerships")
    console.log('Partnership form submitted:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onClose();
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
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
            className="mt-1 h-4 w-4 text-[#F9D960] focus:ring-[#F9D960] border-gray-300 rounded"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-600 font-league-spartan">
            I accept the Terms and Conditions and Privacy Policy *
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-league-spartan"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.acceptTerms}
            className="flex-1 px-6 py-3 bg-[#FF7D05] text-white rounded-lg hover:bg-[#FF7D05]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
          >
            {isSubmitting ? 'Processing...' : 'Submit Partnership Inquiry'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
