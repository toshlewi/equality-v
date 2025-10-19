'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MembershipFormProps {
  onClose: () => void;
}

export function MembershipForm({ onClose }: MembershipFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    membershipYears: '1',
    paymentMethod: 'stripe',
    couponCode: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Connect this form to /api/forms/membership
    // TODO: Store submissions in MongoDB (collection: "members")
    console.log('Membership form submitted:', formData);
    
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
          Make a Change, Join the Sisterhood
        </h2>
        <p className="text-gray-600 font-league-spartan">
          Become a member of our community and help drive gender justice forward. Your voice matters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label htmlFor="membershipYears" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
              Number of Years *
            </label>
            <select
              id="membershipYears"
              name="membershipYears"
              value={formData.membershipYears}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
            >
              <option value="1">1 Year</option>
              <option value="2">2 Years</option>
              <option value="3">3 Years</option>
              <option value="5">5 Years</option>
            </select>
          </div>
        </div>

        {/* Membership Fee Highlight */}
        <div className="bg-gradient-to-r from-[#F9D960] to-[#F9D960]/80 rounded-xl p-6 border-2 border-[#042C45]/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-[#042C45] mb-2 font-fredoka">
              Membership Fee
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#042C45] font-fredoka mb-1">
                KSh {(parseInt(formData.membershipYears) * 5000).toLocaleString()}
              </div>
              <div className="text-lg text-[#042C45]/80 font-league-spartan mb-3">
                for {formData.membershipYears} {parseInt(formData.membershipYears) === 1 ? 'year' : 'years'} 
                <span className="block text-sm mt-1">
                  (KSh 5,000 per year)
                </span>
              </div>
            </div>
            <p className="text-sm text-[#042C45]/80 font-league-spartan">
              All proceeds support our gender justice initiatives
            </p>
          </div>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
          >
            <option value="stripe">Credit/Debit Card (Stripe)</option>
            <option value="mpesa">M-Pesa</option>
          </select>
        </div>

        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
            Coupon Code (Optional)
          </label>
          <input
            type="text"
            id="couponCode"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
            placeholder="Enter coupon code if you have one"
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
            className="flex-1 px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
          >
            {isSubmitting ? 'Processing...' : 'Join Now'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

