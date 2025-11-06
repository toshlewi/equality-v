'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface DonateFormProps {
  onClose: () => void;
}

// Initialize Stripe
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Card payment form component
function CardPaymentForm({ 
  clientSecret, 
  onPaymentSuccess, 
  onPaymentError,
  amount 
}: { 
  clientSecret: string; 
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  amount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onPaymentError(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      } else {
        setError('Payment was not successful');
        onPaymentError('Payment was not successful');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during payment';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'League Spartan, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
          Card Details *
        </label>
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm font-league-spartan">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
      >
        {isProcessing ? 'Processing Payment...' : `Pay KSh ${amount.toLocaleString()}`}
      </button>
    </form>
  );
}

export function DonateForm({ onClose }: DonateFormProps) {
  const [step, setStep] = useState<'personal' | 'payment'>('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    donationType: 'cash',
    amount: '',
    description: '',
    paymentMethod: 'stripe' as 'stripe' | 'mpesa',
    notes: '',
    acceptTerms: false
  });

  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    donationId?: string;
    checkoutRequestId?: string;
    amount: number;
  } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const paymentPollInterval = useRef<NodeJS.Timeout | null>(null);

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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (paymentPollInterval.current) {
        clearInterval(paymentPollInterval.current);
      }
    };
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
    
    if (!siteKey || siteKey === 'your_recaptcha_site_key' || siteKey.trim() === '') {
      return 'dev-placeholder-token';
    }

    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.grecaptcha) {
        resolve('dev-placeholder-token');
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action: 'donation' })
          .then((token: string) => {
            resolve(token);
          })
          .catch(() => {
            resolve('dev-placeholder-token');
          });
      });
    });
  };

  const calculateAmount = () => {
    if (formData.donationType === 'cash') {
      const amount = parseFloat(formData.amount);
      return isNaN(amount) || amount <= 0 ? 0 : amount;
    }
    return 1; // Default for non-cash donations
  };

  // Step 1: Create donation and initialize payment
  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Client-side validation
      if (!formData.name || formData.name.trim().length < 2) {
        throw new Error('Please enter your name (at least 2 characters).');
      }
      
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address.');
      }
      
      if (!formData.phone || formData.phone.trim().length < 10) {
        throw new Error('Please enter a valid phone number (at least 10 characters).');
      }

      if (formData.donationType === 'cash') {
        const amount = calculateAmount();
        if (amount <= 0) {
          throw new Error('Please enter a valid donation amount (minimum KSh 1,000).');
        }
      }

      if ((formData.donationType === 'product' || formData.donationType === 'service' || formData.donationType === 'other') && !formData.description) {
        throw new Error('Please describe what you are donating.');
      }
      
      if (!formData.acceptTerms) {
        throw new Error('Please accept the Terms and Conditions and Privacy Policy.');
      }

      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      let amount = calculateAmount();
      if (amount <= 0) amount = 1; // Minimum for non-cash

      const payload: any = {
        donorName: formData.name.trim(),
        donorEmail: formData.email.trim().toLowerCase(),
        donorPhone: formData.phone.trim(),
        amount: amount,
        donationType: formData.donationType === 'cash' ? 'cash' : formData.donationType === 'product' ? 'product' : 'service',
        category: 'general',
        paymentMethod: formData.donationType === 'cash' ? formData.paymentMethod : 'stripe',
        anonymous: false,
        message: formData.notes || formData.description || undefined,
        termsAccepted: formData.acceptTerms,
        privacyAccepted: formData.acceptTerms,
        recaptchaToken: recaptchaToken
      };

      // Create donation and get payment details
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.details 
          ? Array.isArray(data.details) 
            ? data.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ')
            : data.error || 'Failed to submit donation'
          : data.error || 'Failed to submit donation';
        throw new Error(errorMessage);
      }

      // Store payment data and move to payment step (only for cash donations)
      if (formData.donationType === 'cash' && formData.paymentMethod) {
        setPaymentData({
          clientSecret: data.data?.clientSecret,
          donationId: data.data?.donationId,
          checkoutRequestId: data.data?.checkoutRequestId,
          amount: amount
        });

        // For M-Pesa, use the phone number from form
        if (formData.paymentMethod === 'mpesa') {
          let phoneNumber = formData.phone.trim();
          if (!phoneNumber.startsWith('254')) {
            if (phoneNumber.startsWith('0')) {
              phoneNumber = '254' + phoneNumber.substring(1);
            } else if (phoneNumber.startsWith('7')) {
              phoneNumber = '254' + phoneNumber;
            } else {
              phoneNumber = '254' + phoneNumber;
            }
          }
          setMpesaPhone(phoneNumber);
        }

        setStep('payment');
      } else {
        // Non-cash donations don't require payment
        setSuccess(true);
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

  // Handle Stripe payment success
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentConfirmed(true);
    setSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // Handle M-Pesa STK Push
  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.trim().length < 10) {
      setError('Please enter a valid M-Pesa phone number (e.g., 254712345678)');
      return;
    }

    setIsProcessingPayment(true);
    setError(null);

    try {
      const amount = calculateAmount();
      
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mpesaPhone.trim(),
          amount: amount,
          accountReference: `donation_${paymentData?.donationId}`,
          transactionDesc: 'Donation to Equality Vanguard'
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.details 
          ? Array.isArray(data.details) 
            ? data.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ')
            : data.error || 'Failed to initiate M-Pesa payment'
          : data.error || 'Failed to initiate M-Pesa payment';
        throw new Error(errorMessage);
      }

      if (data.data?.checkoutRequestId) {
        setPaymentData(prev => prev ? {
          ...prev,
          checkoutRequestId: data.data.checkoutRequestId
        } : null);

        startPaymentPolling(data.data.checkoutRequestId);
      }
    } catch (err: any) {
      console.error('M-Pesa payment error:', err);
      setError(err.message || 'Failed to initiate M-Pesa payment');
      setIsProcessingPayment(false);
    }
  };

  // Poll for M-Pesa payment status
  const startPaymentPolling = (checkoutRequestId: string) => {
    if (paymentPollInterval.current) {
      clearInterval(paymentPollInterval.current);
    }

    paymentPollInterval.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/mpesa/query-status?checkoutRequestId=${checkoutRequestId}`);
        const data = await response.json();

        if (data.success && data.data?.resultCode === 0) {
          if (paymentPollInterval.current) {
            clearInterval(paymentPollInterval.current);
            paymentPollInterval.current = null;
          }
          setPaymentConfirmed(true);
          setSuccess(true);
          setIsProcessingPayment(false);
          
          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (data.data?.resultCode && data.data.resultCode !== 1032) {
          if (paymentPollInterval.current) {
            clearInterval(paymentPollInterval.current);
            paymentPollInterval.current = null;
          }
          setError(data.data.resultDesc || 'Payment failed');
          setIsProcessingPayment(false);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000);

    setTimeout(() => {
      if (paymentPollInterval.current) {
        clearInterval(paymentPollInterval.current);
        paymentPollInterval.current = null;
      }
      if (!paymentConfirmed) {
        setError('Payment timeout. Please try again.');
        setIsProcessingPayment(false);
      }
    }, 120000);
  };

  const elementsOptions: StripeElementsOptions = paymentData?.clientSecret ? {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: 'stripe',
    },
  } : {};

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

      <AnimatePresence mode="wait">
        {step === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
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
                  disabled={isSubmitting || !formData.acceptTerms}
                  className="flex-1 px-6 py-3 bg-[#66623C] text-white rounded-lg hover:bg-[#66623C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
                >
                  {isSubmitting ? 'Processing...' : formData.donationType === 'cash' ? 'Continue to Payment' : 'Submit Donation'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'payment' && paymentData && formData.donationType === 'cash' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep('personal')}
                  className="text-[#042C45] hover:text-[#042C45]/80 font-league-spartan flex items-center gap-2"
                >
                  ← Back
                </button>
                <div className="text-sm text-gray-600 font-league-spartan">
                  Step 2 of 2
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#F9D960] to-[#F9D960]/80 rounded-xl p-6 border-2 border-[#042C45]/20">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-[#042C45] mb-2 font-fredoka">
                    Donation Amount
                  </h3>
                  <div className="text-3xl font-bold text-[#042C45] font-fredoka">
                    KSh {paymentData.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {formData.paymentMethod === 'stripe' && paymentData.clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <CardPaymentForm
                    clientSecret={paymentData.clientSecret}
                    onPaymentSuccess={handleStripePaymentSuccess}
                    onPaymentError={(err) => setError(err)}
                    amount={paymentData.amount}
                  />
                </Elements>
              )}
              
              {formData.paymentMethod === 'stripe' && !stripePromise && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700 text-sm font-league-spartan">
                    Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
                  </p>
                </div>
              )}

              {formData.paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700 mb-2 font-league-spartan">
                      M-Pesa Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="mpesaPhone"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      required
                      placeholder="254712345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F9D960] focus:border-transparent transition-colors font-league-spartan"
                    />
                    <p className="text-xs text-gray-500 mt-1 font-league-spartan">
                      Format: 254712345678 (include country code)
                    </p>
                  </div>

                  <button
                    onClick={handleMpesaPayment}
                    disabled={!mpesaPhone || isProcessingPayment || paymentConfirmed}
                    className="w-full px-6 py-3 bg-[#66623C] text-white rounded-lg hover:bg-[#66623C]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-league-spartan"
                  >
                    {isProcessingPayment 
                      ? 'Processing STK Push...' 
                      : paymentConfirmed 
                      ? 'Payment Confirmed!' 
                      : 'Send M-Pesa STK Push'}
                  </button>

                  {isProcessingPayment && !paymentConfirmed && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-700 text-sm font-league-spartan">
                        Please check your phone and complete the M-Pesa payment. We're waiting for confirmation...
                      </p>
                    </div>
                  )}

                  {error && error.includes('not configured') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 text-sm font-league-spartan font-semibold mb-2">
                        M-Pesa Configuration Required
                      </p>
                      <p className="text-yellow-700 text-sm font-league-spartan">
                        {error}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && !error.includes('not configured') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm font-league-spartan">{error}</p>
                </div>
              )}

              {paymentConfirmed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm font-league-spartan">
                    ✅ Payment confirmed! Thank you for your donation. You'll receive a confirmation email shortly.
                  </p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-league-spartan"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
