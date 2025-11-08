'use client';

import { motion, useTransform } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModalForm } from './ModalForm';
import { MembershipForm } from './forms/MembershipForm';
import { PartnerForm } from './forms/PartnerForm';
import { DonateForm } from './forms/DonateForm';
import { ContactForm } from './forms/ContactForm';

interface CardItemProps {
  card: {
    id: number;
    title: string;
    description: string;
    action: string;
    color: string;
    accentColor: string;
  };
  index: number;
  totalCards: number;
  scrollProgress: any; // TODO: Type this properly with Framer Motion types
}

export function CardItem({ card, index, totalCards, scrollProgress }: CardItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Calculate card position based on scroll progress - matches Purpose Talent behavior
  const cardPosition = useTransform(scrollProgress, (value: number) => {
    const progress = value - index;
    return Math.max(0, Math.min(1, progress));
  });

  // Purpose Talent-style stacking: cards slide up and fade out smoothly
  const cardScale = useTransform(cardPosition, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.85]);
  const cardOpacity = useTransform(cardPosition, [0, 0.1, 0.9, 1], [0.3, 1, 1, 0]);
  const cardY = useTransform(cardPosition, [0, 0.5, 1], [60, 0, -60]);
  
  // Add subtle rotation for more dynamic effect
  const cardRotate = useTransform(cardPosition, [0, 0.5, 1], [2, 0, -2]);

  // Calculate z-index (higher index cards on top) - creates proper stacking
  const zIndex = totalCards - index;

  const handleCardClick = () => {
    switch (card.action) {
      case 'membership':
      case 'partner':
      case 'donate':
      case 'contact':
        setIsModalOpen(true);
        break;
      case 'merch':
        router.push('/buy-merch');
        break;
      case 'jobs':
        router.push('/jobs-volunteer');
        break;
      default:
        break;
    }
  };

  const renderForm = () => {
    switch (card.action) {
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
    <>
      <motion.div
        className="absolute inset-0 cursor-pointer"
        style={{
          scale: cardScale,
          opacity: cardOpacity,
          y: cardY,
          rotate: cardRotate,
          zIndex: zIndex,
        }}
        onClick={handleCardClick}
        whileHover={{ 
          scale: 1.02,
          rotate: 0,
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: 0.98,
          transition: { duration: 0.1 }
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40,
          mass: 0.8
        }}
      >
        <div className={`bg-gradient-to-br ${card.color} rounded-3xl shadow-2xl p-8 h-80 flex flex-col justify-center items-center text-center relative overflow-hidden border border-white/20`}>
          {/* Purpose Talent-style subtle background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-6 right-6 w-24 h-24 border border-white/30 rounded-full"></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border border-white/20 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <motion.h3 
              className="text-3xl md:text-4xl font-bold mb-4 font-fredoka"
              style={{ color: card.accentColor }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {card.title}
            </motion.h3>
            
            <motion.p 
              className="text-lg md:text-xl mb-8 font-league-spartan"
              style={{ color: card.accentColor, opacity: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {card.description}
            </motion.p>
            
            <motion.button
              className="px-8 py-4 bg-white/25 backdrop-blur-sm border-2 border-white/40 rounded-full font-semibold font-league-spartan transition-all duration-300 hover:bg-white/35 hover:border-white/60 hover:shadow-lg"
              style={{ color: card.accentColor }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                y: -2,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.95,
                transition: { duration: 0.1 }
              }}
            >
              {card.action === 'merch' ? 'Shop Now' : 
               card.action === 'jobs' ? 'View Opportunities' : 
               'Get Started'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal for forms */}
      <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {renderForm()}
      </ModalForm>
    </>
  );
}
