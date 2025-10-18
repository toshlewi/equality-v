"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users, CreditCard, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    paymentMethod: '',
    memberCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // TODO: Implement actual registration API call
    // POST /api/events/register
    // {
    //   eventId: event.id,
    //   attendeeName: formData.name,
    //   email: formData.email,
    //   phone: formData.phone,
    //   ticketCount: formData.tickets,
    //   paymentMethod: formData.paymentMethod,
    //   memberCode: formData.memberCode
    // }
    
    // Simulate API call
    setTimeout(() => {
      setRegistrationStep('confirmation');
      setIsSubmitting(false);
    }, 2000);
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
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                  className="object-cover"
                />
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
                        {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Payment Selection */}
              {registrationStep === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t pt-6"
                >
                  <h3 className="font-fredoka text-lg font-semibold text-white mb-4">
                    Payment Method
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="text-center text-xl font-semibold text-white mb-6">
                      Total: {formatPrice(totalPrice)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, paymentMethod: 'stripe' })}
                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                          formData.paymentMethod === 'stripe'
                            ? 'border-brand-yellow bg-brand-yellow/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-6 h-6 text-brand-orange" />
                          <div>
                            <div className="font-semibold">Stripe</div>
                            <div className="text-sm text-gray-500">Credit/Debit Card</div>
                          </div>
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, paymentMethod: 'mpesa' })}
                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                          formData.paymentMethod === 'mpesa'
                            ? 'border-brand-yellow bg-brand-yellow/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-6 h-6 text-brand-orange" />
                          <div>
                            <div className="font-semibold">M-Pesa</div>
                            <div className="text-sm text-gray-500">Mobile Money</div>
                          </div>
                        </div>
                      </motion.button>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setRegistrationStep('form')}
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setRegistrationStep('confirmation')}
                        disabled={!formData.paymentMethod}
                        className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                      >
                        Complete Registration
                      </Button>
                    </div>
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
