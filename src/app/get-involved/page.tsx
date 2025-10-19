'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ModalForm } from '@/components/get-involved/ModalForm';
import { MembershipForm } from '@/components/get-involved/forms/MembershipForm';
import { PartnerForm } from '@/components/get-involved/forms/PartnerForm';
import { DonateForm } from '@/components/get-involved/forms/DonateForm';
import { ContactForm } from '@/components/get-involved/forms/ContactForm';

const cards = [
  {
    id: 1,
    title: "Make a Change. Join the Sisterhood.",
    subtitle: "Become a member of our community and help drive gender justice forward. Your voice matters.",
    action: "membership",
    borderColor: "border-[#F9D960]", // Yellow outline for navy card
    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
    textColor: "text-white",
    accentColor: "text-[#F9D960]"
  },
  {
    id: 2,
    title: "Partner With Us.",
    subtitle: "Join forces with us to create lasting impact. Together we can achieve more.",
    action: "partner",
    borderColor: "border-[#FF7D05]", // Orange outline for yellow card
    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
    textColor: "text-[#042C45]",
    accentColor: "text-[#042C45]"
  },
  {
    id: 3,
    title: "Donate and Support Our Work.",
    subtitle: "Help fund our initiatives and campaigns. Every contribution makes a difference.",
    action: "donate",
    borderColor: "border-[#042C45]", // Navy outline for orange card
    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
    textColor: "text-white",
    accentColor: "text-white"
  },
  {
    id: 4,
    title: "Buy Merch.",
    subtitle: "Show your support with our feminist merchandise. Wear your values proudly.",
    action: "merch",
    borderColor: "border-[#F9D960]", // Yellow outline for navy card
    bgColor: "bg-gradient-to-br from-[#042C45] to-[#042C45]/90",
    textColor: "text-white",
    accentColor: "text-[#F9D960]"
  },
  {
    id: 5,
    title: "Jobs & Volunteer.",
    subtitle: "Join our team or volunteer your time. Be part of the change you want to see.",
    action: "jobs",
    borderColor: "border-[#FF7D05]", // Orange outline for yellow card
    bgColor: "bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90",
    textColor: "text-[#042C45]",
    accentColor: "text-[#042C45]"
  },
  {
    id: 6,
    title: "Contact Us.",
    subtitle: "Have questions or ideas? We'd love to hear from you. Let's start a conversation.",
    action: "contact",
    borderColor: "border-[#042C45]", // Navy outline for orange card
    bgColor: "bg-gradient-to-br from-[#FF7D05] to-[#FF7D05]/90",
    textColor: "text-white",
    accentColor: "text-white"
  }
];

export default function GetInvolvedPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  const handleCardClick = (action: string) => {
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
      
      {/* Hero Section */}
      <motion.section 
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/hero-1.png)'
            }}
          >
            {/* Overlay for better text readability */}
            <div className="w-full h-full bg-gradient-to-br from-[#042C45]/80 via-[#042C45]/60 to-[#FF7D05]/40"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 font-fredoka leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Get Involved
          </motion.h1>
          
          <motion.p 
            className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 font-league-spartan max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Join our movement for gender justice. Together, we can create lasting change and build a more equitable world.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="px-8 py-4 bg-[#F9D960] text-[#042C45] rounded-full font-semibold font-league-spartan text-lg hover:bg-[#F9D960]/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('cards-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Opportunities
            </motion.button>
            
            <motion.button
              className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold font-league-spartan text-lg hover:bg-white hover:text-[#042C45] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('cards-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-1/3 w-8 h-8 bg-white/10 rounded-full"></div>
        </div>
      </motion.section>

      {/* Main container */}
      <div id="cards-section" className="min-h-screen w-full flex items-center justify-center py-20">
        {/* Stacked Cards Container */}
        <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="relative w-full max-w-lg h-[600px]">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                className={`absolute inset-0 ${card.bgColor} ${card.borderColor} border-4 rounded-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:shadow-3xl backdrop-blur-sm p-8`}
                style={{
                  transform: `translateY(${index * 12}px) rotate(${index % 2 === 0 ? 2 : -2}deg)`,
                  zIndex: cards.length - index,
                  opacity: 1
                }}
                onClick={() => handleCardClick(card.action)}
                initial={{ opacity: 0, y: 50, rotate: 0 }}
                animate={{ 
                  opacity: 1, 
                  y: index * 12, 
                  rotate: index % 2 === 0 ? 2 : -2 
                }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ 
                  scale: 1.02,
                  rotate: 0,
                  y: index * 12 - 5,
                  zIndex: 999,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }}
              >
                <div className="h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-10 left-10 w-32 h-32 border-2 border-current rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-current rounded-full"></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-current rounded-full"></div>
                  </div>

                  {/* Card Icon */}
                  <motion.div 
                    className={`w-20 h-20 ${card.accentColor} mb-8 flex items-center justify-center relative z-10`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="w-16 h-16 border-4 border-current rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold">{card.id}</span>
                    </div>
                  </motion.div>

                  {/* Card Title */}
                  <motion.h2 
                    className={`text-3xl md:text-4xl font-bold ${card.textColor} mb-6 font-fredoka leading-tight relative z-10`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {card.title}
                  </motion.h2>

                  {/* Card Subtitle */}
                  <motion.p 
                    className={`text-lg md:text-xl ${card.textColor} opacity-80 font-league-spartan max-w-2xl leading-relaxed relative z-10 px-6`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.8, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    {card.subtitle}
                  </motion.p>

                  {/* Action Button */}
                  <motion.div
                    className="mt-8 relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <motion.div 
                      className={`px-8 py-4 border-2 rounded-full font-semibold font-league-spartan transition-all duration-300 backdrop-blur-sm text-base ${
                        card.textColor === 'text-white' 
                          ? 'border-white text-white hover:bg-white hover:text-[#042C45]' 
                          : 'border-[#042C45] text-[#042C45] hover:bg-[#042C45] hover:text-white'
                      }`}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                    >
                      {card.action === 'merch' ? 'Shop Now' : 
                       card.action === 'jobs' ? 'View Opportunities' : 
                       'Get Started'}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for forms */}
      <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderForm()}
      </ModalForm>
    </div>
  );
}