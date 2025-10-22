'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ModalForm } from '@/components/get-involved/ModalForm';
import { MembershipForm } from '@/components/get-involved/forms/MembershipForm';
import { PartnerForm } from '@/components/get-involved/forms/PartnerForm';
import { DonateForm } from '@/components/get-involved/forms/DonateForm';
import { ContactForm } from '@/components/get-involved/forms/ContactForm';

// Hero slides data
const heroSlides = [
  {
    id: 1,
    title: "Make a change, join the sisterhood",
    buttonText: "Join the movement",
    buttonAction: "membership",
    backgroundImage: "/images/team3.JPG"
  },
  {
    id: 2,
    title: "Fund the vanguard, fund the change",
    buttonText: "Donate",
    buttonAction: "donate",
    backgroundImage: "/images/team1.JPG"
  },
  {
    id: 3,
    title: "Partner with us – join us in advancing gender justice through transformative Pan-African action. Together we can create sustainable income across communities.",
    buttonText: "Partner with us",
    buttonAction: "partner",
    backgroundImage: "/images/team4.JPG"
  },
  {
    id: 4,
    title: "Your new favorite feminist everything",
    buttonText: "Buy merch",
    buttonAction: "merch",
    backgroundImage: "/images/merch1.JPG"
  },
  {
    id: 5,
    title: "Equality is not a dream, it is our work",
    buttonText: "Join us",
    buttonAction: "jobs",
    backgroundImage: "/images/team6.JPG"
  },
  {
    id: 6,
    title: "Contact us",
    buttonText: "Contact us",
    buttonAction: "contact",
    backgroundImage: "/images/team2.JPG"
  }
];


export default function GetInvolvedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of manual interaction
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'membership':
      case 'partner':
      case 'donate':
      case 'contact':
        setCurrentAction(action);
        setIsModalOpen(true);
        break;
      case 'merch':
        window.location.href = '/buy-merch';
        break;
      case 'jobs':
        window.location.href = '/jobs-volunteer';
        break;
      default:
        break;
    }
  };

  const renderForm = () => {
    switch (currentAction) {
      case 'membership':
        return <MembershipForm onClose={() => setIsModalOpen(false)} />;
      case 'partner':
        return <PartnerForm onClose={() => setIsModalOpen(false)} />;
      case 'donate':
        return <DonateForm onClose={() => setIsModalOpen(false)} />;
      case 'contact':
        return <ContactForm onClose={() => setIsModalOpen(false)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background with subtle texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-50"></div>
      
      {/* Animated Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {/* Background Image */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${heroSlides[currentSlide].backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
                width: '100%',
                backgroundAttachment: 'fixed'
              }}
            >
              {/* Dynamic Overlay */}
              <div className="w-full h-full bg-gradient-to-br from-[#042C45]/80 via-[#042C45]/60 to-[#FF7D05]/40"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 font-fredoka leading-tight px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.button
                    className="px-6 py-3 sm:px-8 sm:py-4 bg-[#F9D960] text-[#042C45] rounded-full font-semibold font-league-spartan text-base sm:text-lg hover:bg-[#F9D960]/90 transition-colors w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction(heroSlides[currentSlide].buttonAction)}
                  >
                    {heroSlides[currentSlide].buttonText}
                  </motion.button>
                  
                  <motion.button
                    className="px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white rounded-full font-semibold font-league-spartan text-base sm:text-lg hover:bg-white hover:text-[#042C45] transition-colors w-full sm:w-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                  >
                    Explore All
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-[#F9D960] scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div 
            className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute bottom-20 right-1/3 w-8 h-8 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>
      </section>

      {/* Animated Cards Section */}
      <section id="get-involved" className="min-h-screen w-full py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-8 md:mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#042C45] mb-4 font-fredoka">
              Ways to Get Involved
            </h2>
            <p className="text-xl text-gray-600 font-league-spartan max-w-3xl mx-auto">
              Choose how you want to join our movement for gender justice and make a lasting impact
            </p>
          </motion.div>

          {/* Cards Container */}
          <div className="space-y-4 md:space-y-8 lg:space-y-10 xl:space-y-12">
            {/* Top Row - Moving Left */}
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
              <motion.div
                className="flex space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 absolute top-0 left-0"
                animate={{ x: [0, -200, 0] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ width: "calc(400% + 2rem)" }}
              >
                {/* First set of 3 cards */}
                {[
                  {
                    id: 1,
                    title: "Join the Sisterhood",
                    subtitle: "Become a member and help drive gender justice forward",
                    action: "membership",
                    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
                    borderColor: "border-[#F9D960]",
                    textColor: "text-white",
                    accentColor: "text-[#F9D960]",
                    icon: "👥"
                  },
                  {
                    id: 2,
                    title: "Partner With Us",
                    subtitle: "Join forces to create lasting impact together",
                    action: "partner",
                    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
                    borderColor: "border-[#FF7D05]",
                    textColor: "text-[#042C45]",
                    accentColor: "text-[#042C45]",
                    icon: "🤝"
                  },
                  {
                    id: 3,
                    title: "Support Our Work",
                    subtitle: "Help fund our initiatives and campaigns",
                    action: "donate",
                    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
                    borderColor: "border-[#042C45]",
                    textColor: "text-white",
                    accentColor: "text-white",
                    icon: "💝"
                  }
                ].map((card, index) => (
                  <motion.div
                    key={`top-${card.id}`}
                    id={card.action}
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 ${card.bgColor} ${card.borderColor} border-4 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex-shrink-0`}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleAction(card.action)}
                    style={{ animationPlayState: "running" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animationPlayState = "paused";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animationPlayState = "running";
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-6 md:left-6 w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-current rounded-full"></div>
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-6 md:right-6 w-4 h-4 sm:w-6 sm:h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 border-2 border-current rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 lg:w-12 lg:h-12 border-2 border-current rounded-full"></div>
                      </div>

                      {/* Card Icon */}
                      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 ${card.accentColor} relative z-10`}>
                        {card.icon}
                      </div>

                      {/* Card Title */}
                      <h3 className={`text-sm sm:text-base md:text-lg lg:text-2xl font-bold ${card.textColor} mb-2 sm:mb-3 md:mb-4 font-fredoka leading-tight relative z-10`}>
                        {card.title}
                      </h3>

                      {/* Card Subtitle */}
                      <p className={`text-xs sm:text-sm md:text-base ${card.textColor} opacity-80 font-league-spartan leading-relaxed relative z-10`}>
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Duplicate set for seamless loop */}
                {[
                  {
                    id: 1,
                    title: "Join the Sisterhood",
                    subtitle: "Become a member and help drive gender justice forward",
                    action: "membership",
                    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
                    borderColor: "border-[#F9D960]",
                    textColor: "text-white",
                    accentColor: "text-[#F9D960]",
                    icon: "👥"
                  },
                  {
                    id: 2,
                    title: "Partner With Us",
                    subtitle: "Join forces to create lasting impact together",
                    action: "partner",
                    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
                    borderColor: "border-[#FF7D05]",
                    textColor: "text-[#042C45]",
                    accentColor: "text-[#042C45]",
                    icon: "🤝"
                  },
                  {
                    id: 3,
                    title: "Support Our Work",
                    subtitle: "Help fund our initiatives and campaigns",
                    action: "donate",
                    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
                    borderColor: "border-[#042C45]",
                    textColor: "text-white",
                    accentColor: "text-white",
                    icon: "💝"
                  }
                ].map((card, index) => (
                  <motion.div
                    key={`top-duplicate-${card.id}`}
                    id={`${card.action}-duplicate`}
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 ${card.bgColor} ${card.borderColor} border-4 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex-shrink-0`}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleAction(card.action)}
                    style={{ animationPlayState: "running" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animationPlayState = "paused";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animationPlayState = "running";
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-6 md:left-6 w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-current rounded-full"></div>
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-6 md:right-6 w-4 h-4 sm:w-6 sm:h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 border-2 border-current rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 lg:w-12 lg:h-12 border-2 border-current rounded-full"></div>
                      </div>

                      {/* Card Icon */}
                      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 ${card.accentColor} relative z-10`}>
                        {card.icon}
                      </div>

                      {/* Card Title */}
                      <h3 className={`text-sm sm:text-base md:text-lg lg:text-2xl font-bold ${card.textColor} mb-2 sm:mb-3 md:mb-4 font-fredoka leading-tight relative z-10`}>
                        {card.title}
                      </h3>

                      {/* Card Subtitle */}
                      <p className={`text-xs sm:text-sm md:text-base ${card.textColor} opacity-80 font-league-spartan leading-relaxed relative z-10`}>
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom Row - Moving Right */}
            <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80">
              <motion.div
                className="flex space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8 absolute top-0 left-0"
                animate={{ x: [0, 200, 0] }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2
                }}
                style={{ width: "calc(400% + 2rem)" }}
              >
                {/* First set of 3 cards */}
                {[
                  {
                    id: 4,
                    title: "Buy Merch",
                    subtitle: "Show your support with our feminist merchandise",
                    action: "merch",
                    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
                    borderColor: "border-[#F9D960]",
                    textColor: "text-white",
                    accentColor: "text-[#F9D960]",
                    icon: "🛍️"
                  },
                  {
                    id: 5,
                    title: "Jobs & Volunteer",
                    subtitle: "Join our team or volunteer your time",
                    action: "jobs",
                    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
                    borderColor: "border-[#FF7D05]",
                    textColor: "text-[#042C45]",
                    accentColor: "text-[#042C45]",
                    icon: "💼"
                  },
                  {
                    id: 6,
                    title: "Contact Us",
                    subtitle: "Have questions or ideas? Let's start a conversation",
                    action: "contact",
                    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
                    borderColor: "border-[#042C45]",
                    textColor: "text-white",
                    accentColor: "text-white",
                    icon: "📞"
                  }
                ].map((card, index) => (
                  <motion.div
                    key={`bottom-${card.id}`}
                    id={card.action}
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 ${card.bgColor} ${card.borderColor} border-4 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex-shrink-0`}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleAction(card.action)}
                    style={{ animationPlayState: "running" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animationPlayState = "paused";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animationPlayState = "running";
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-6 md:left-6 w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-current rounded-full"></div>
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-6 md:right-6 w-4 h-4 sm:w-6 sm:h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 border-2 border-current rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 lg:w-12 lg:h-12 border-2 border-current rounded-full"></div>
                      </div>

                      {/* Card Icon */}
                      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 ${card.accentColor} relative z-10`}>
                        {card.icon}
                      </div>

                      {/* Card Title */}
                      <h3 className={`text-sm sm:text-base md:text-lg lg:text-2xl font-bold ${card.textColor} mb-2 sm:mb-3 md:mb-4 font-fredoka leading-tight relative z-10`}>
                        {card.title}
                      </h3>

                      {/* Card Subtitle */}
                      <p className={`text-xs sm:text-sm md:text-base ${card.textColor} opacity-80 font-league-spartan leading-relaxed relative z-10`}>
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Duplicate set for seamless loop */}
                {[
                  {
                    id: 4,
                    title: "Buy Merch",
                    subtitle: "Show your support with our feminist merchandise",
                    action: "merch",
                    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
                    borderColor: "border-[#F9D960]",
                    textColor: "text-white",
                    accentColor: "text-[#F9D960]",
                    icon: "🛍️"
                  },
                  {
                    id: 5,
                    title: "Jobs & Volunteer",
                    subtitle: "Join our team or volunteer your time",
                    action: "jobs",
                    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
                    borderColor: "border-[#FF7D05]",
                    textColor: "text-[#042C45]",
                    accentColor: "text-[#042C45]",
                    icon: "💼"
                  },
                  {
                    id: 6,
                    title: "Contact Us",
                    subtitle: "Have questions or ideas? Let's start a conversation",
                    action: "contact",
                    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
                    borderColor: "border-[#042C45]",
                    textColor: "text-white",
                    accentColor: "text-white",
                    icon: "📞"
                  }
                ].map((card, index) => (
                  <motion.div
                    key={`bottom-duplicate-${card.id}`}
                    id={`${card.action}-duplicate`}
                    className={`w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 xl:w-72 xl:h-72 ${card.bgColor} ${card.borderColor} border-4 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-sm p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex-shrink-0`}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    onClick={() => handleAction(card.action)}
                    style={{ animationPlayState: "running" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.animationPlayState = "paused";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.animationPlayState = "running";
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-6 md:left-6 w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20 border-2 border-current rounded-full"></div>
                        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-6 md:right-6 w-4 h-4 sm:w-6 sm:h-6 md:w-12 md:h-12 lg:w-16 lg:h-16 border-2 border-current rounded-full"></div>
                        <div className="absolute top-1/2 left-1/4 w-3 h-3 sm:w-4 sm:h-4 md:w-8 md:h-8 lg:w-12 lg:h-12 border-2 border-current rounded-full"></div>
                      </div>

                      {/* Card Icon */}
                      <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 lg:mb-6 ${card.accentColor} relative z-10`}>
                        {card.icon}
                      </div>

                      {/* Card Title */}
                      <h3 className={`text-sm sm:text-base md:text-lg lg:text-2xl font-bold ${card.textColor} mb-2 sm:mb-3 md:mb-4 font-fredoka leading-tight relative z-10`}>
                        {card.title}
                      </h3>

                      {/* Card Subtitle */}
                      <p className={`text-xs sm:text-sm md:text-base ${card.textColor} opacity-80 font-league-spartan leading-relaxed relative z-10`}>
                        {card.subtitle}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal for forms */}
      <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderForm()}
      </ModalForm>
    </div>
  );
}