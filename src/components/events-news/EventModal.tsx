"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users, CreditCard, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details *
        </label>
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-brand-yellow text-brand-teal rounded-lg hover:bg-brand-orange hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {isProcessing ? 'Processing Payment...' : `Pay KSh ${amount.toLocaleString()}`}
      </button>
    </form>
  );
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number | null;
  image: string;
  category: string;
  description: string;
  instructor?: string;
  featured?: boolean;
}

interface EventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const [registrationStep, setRegistrationStep] = useState<'details' | 'form' | 'payment' | 'confirmation'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tickets: 1,
    paymentMethod: 'stripe' as 'stripe' | 'mpesa',
    memberCode: ''
  });
  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    registrationId?: string;
    checkoutRequestId?: string;
    amount: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const paymentPollInterval = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (paymentPollInterval.current) {
        clearInterval(paymentPollInterval.current);
      }
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "Free";
    return `KSh ${price.toLocaleString()}`;
  };

  const totalPrice = event.price ? event.price * formData.tickets : 0;

  const handleSubmit = async (e: React.FormEvent) => {
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

      // If event is free, skip payment
      if (!event.price || event.price === 0) {
        const response = await fetch('/api/events/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event.id,
            attendeeName: formData.name,
            email: formData.email,
            phone: formData.phone,
            ticketCount: formData.tickets,
            paymentMethod: 'free',
            memberCode: formData.memberCode || undefined
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to register for event');
        }

        setRegistrationStep('confirmation');
        return;
      }

      // For paid events, create registration and move to payment
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          attendeeName: formData.name,
          email: formData.email,
          phone: formData.phone,
          ticketCount: formData.tickets,
          paymentMethod: formData.paymentMethod,
          memberCode: formData.memberCode || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.details 
          ? Array.isArray(data.details) 
            ? data.details.map((err: any) => `${err.path?.join('.')}: ${err.message}`).join(', ')
            : data.error || 'Failed to register for event'
          : data.error || 'Failed to register for event';
        throw new Error(errorMessage);
      }

      // Store payment data and move to payment step
      setPaymentData({
        clientSecret: data.data?.clientSecret,
        registrationId: data.data?.registrationId,
        checkoutRequestId: data.data?.checkoutRequestId,
        amount: totalPrice
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

      setRegistrationStep('payment');
    } catch (err: any) {
      console.error('Event registration error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Stripe payment success
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentConfirmed(true);
    setRegistrationStep('confirmation');
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
      const response = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mpesaPhone.trim(),
          amount: totalPrice,
          accountReference: `event_${paymentData?.registrationId}`,
          transactionDesc: `Event Registration: ${event.title}`
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
          setIsProcessingPayment(false);
          setRegistrationStep('confirmation');
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

  const resetModal = () => {
    setRegistrationStep('details');
    setFormData({
      name: '',
      email: '',
      phone: '',
      tickets: 1,
      paymentMethod: '',
      memberCode: ''
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-3/4 h-full bg-brand-teal overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-brand-teal border-b border-white/20 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-fredoka text-2xl font-bold text-white">
                  {event.title}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-brand-yellow transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Event Image */}
              <div className="relative h-64 rounded-lg overflow-hidden">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 75vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-yellow text-brand-teal px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                {event.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-white/90">
                    <Calendar className="w-5 h-5 mr-3 text-brand-yellow" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Clock className="w-5 h-5 mr-3 text-brand-yellow" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <MapPin className="w-5 h-5 mr-3 text-brand-yellow" />
                    <span>{event.location}</span>
                  </div>
                  {event.instructor && (
                    <div className="flex items-center text-white/90">
                      <Users className="w-5 h-5 mr-3 text-brand-yellow" />
                      <span>{event.instructor}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatPrice(event.price)}
                  </div>
                  {event.price && (
                    <p className="text-sm text-white/70">per person</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-fredoka text-lg font-semibold text-white mb-2">
                  About this event
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Registration Form */}
              {registrationStep === 'form' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-6"
                >
                  <h3 className="font-fredoka text-lg font-semibold text-white mb-4">
                    Registration Details
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tickets">Number of Tickets</Label>
                        <Select
                          value={formData.tickets.toString()}
                          onValueChange={(value) => setFormData({ ...formData, tickets: parseInt(value) })}
                        >
                          <SelectTrigger id="tickets">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} ticket{num > 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="memberCode">Member Code (Optional)</Label>
                      <Input
                        id="memberCode"
                        value={formData.memberCode}
                        onChange={(e) => setFormData({ ...formData, memberCode: e.target.value })}
                        placeholder="Enter member discount code"
                      />
                    </div>

                    {event.price && event.price > 0 && (
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select
                          value={formData.paymentMethod}
                          onValueChange={(value: 'stripe' | 'mpesa') => setFormData({ ...formData, paymentMethod: value })}
                        >
                          <SelectTrigger id="paymentMethod">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="stripe">Credit/Debit Card (Stripe)</SelectItem>
                            <SelectItem value="mpesa">M-Pesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRegistrationStep('details')}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                      >
                        {isSubmitting ? 'Processing...' : (event.price && event.price > 0 ? 'Continue to Payment' : 'Complete Registration')}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Payment Selection */}
              {registrationStep === 'payment' && paymentData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setRegistrationStep('form')}
                      className="text-white hover:text-brand-yellow transition-colors flex items-center gap-2"
                    >
                      ← Back
                    </button>
                    <div className="text-sm text-white/70">
                      Step 2 of 2
                    </div>
                  </div>

                  <div className="bg-brand-yellow/20 rounded-xl p-6 border-2 border-brand-yellow/50 mb-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2 font-fredoka">
                        Payment Amount
                      </h3>
                      <div className="text-3xl font-bold text-white font-fredoka">
                        {formatPrice(paymentData.amount)}
                      </div>
                    </div>
                  </div>

                  {formData.paymentMethod === 'stripe' && paymentData.clientSecret && stripePromise && (
                    <Elements stripe={stripePromise} options={{
                      clientSecret: paymentData.clientSecret,
                      appearance: { theme: 'stripe' },
                    }}>
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
                      <p className="text-yellow-700 text-sm">
                        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
                      </p>
                    </div>
                  )}

                  {formData.paymentMethod === 'mpesa' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mpesaPhone">M-Pesa Phone Number *</Label>
                        <Input
                          id="mpesaPhone"
                          type="tel"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          required
                          placeholder="254712345678"
                        />
                        <p className="text-xs text-white/70 mt-1">
                          Format: 254712345678 (include country code)
                        </p>
                      </div>

                      <Button
                        onClick={handleMpesaPayment}
                        disabled={!mpesaPhone || isProcessingPayment || paymentConfirmed}
                        className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white disabled:opacity-50"
                      >
                        {isProcessingPayment 
                          ? 'Processing STK Push...' 
                          : paymentConfirmed 
                          ? 'Payment Confirmed!' 
                          : 'Send M-Pesa STK Push'}
                      </Button>

                      {isProcessingPayment && !paymentConfirmed && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-700 text-sm">
                            Please check your phone and complete the M-Pesa payment. We're waiting for confirmation...
                          </p>
                        </div>
                      )}

                      {error && error.includes('not configured') && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm font-semibold mb-2">
                            M-Pesa Configuration Required
                          </p>
                          <p className="text-yellow-700 text-sm">
                            {error}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {error && !error.includes('not configured') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {paymentConfirmed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 text-sm">
                        ✅ Payment confirmed! Your registration is being processed. You'll receive a confirmation email shortly.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRegistrationStep('form')}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Confirmation */}
              {registrationStep === 'confirmation' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-6 text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-fredoka text-xl font-semibold text-white mb-2">
                    Registration Successful!
                  </h3>
                  <p className="text-white/90 mb-6">
                    You have successfully registered for {event.title}. 
                    A confirmation email has been sent to {formData.email}.
                  </p>
                  <Button
                    onClick={handleClose}
                    className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                  >
                    Close
                  </Button>
                </motion.div>
              )}

              {/* Action Buttons for Details View */}
              {registrationStep === 'details' && (
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => setRegistrationStep('form')}
                    className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
