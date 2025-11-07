'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ModalForm } from './ModalForm';
import { MembershipForm } from './forms/MembershipForm';
import { PartnerForm } from './forms/PartnerForm';
import { DonateForm } from './forms/DonateForm';
import { ContactForm } from './forms/ContactForm';

const cards = [
  {
    id: 1,
    title: "Make a Change, Join the Sisterhood",
    description: "Become a member of our community and help drive gender justice forward. Your voice matters.",
    action: "membership",
    color: "from-[#042C45] to-[#042C45]/90",
    accentColor: "#FFD935"
  },
  {
    id: 2,
    title: "Partner With Us",
    description: "Join forces with us to create lasting impact. Together we can achieve more.",
    action: "partner",
    color: "from-[#FF7D05] to-[#FF7D05]/90",
    accentColor: "#FFFFFF"
  },
  {
    id: 3,
    title: "Donate and Support Our Work",
    description: "Help fund our initiatives and campaigns. Every contribution makes a difference.",
    action: "donate",
    color: "from-[#66623C] to-[#66623C]/90",
    accentColor: "#FFD935"
  },
  {
    id: 4,
    title: "Buy Merch",
    description: "Show your support with our feminist merchandise. Wear your values proudly.",
    action: "merch",
    color: "from-[#FFD935] to-[#FFD935]/90",
    accentColor: "#042C45"
  },
  {
    id: 5,
    title: "Jobs & Volunteer",
    description: "Join our team or volunteer your time. Be part of the change you want to see.",
    action: "jobs",
    color: "from-[#042C45] to-[#FF7D05]",
    accentColor: "#FFFFFF"
  },
  {
    id: 6,
    title: "Contact Us",
    description: "Have questions or ideas? We'd love to hear from you. Let's start a conversation.",
    action: "contact",
    color: "from-[#66623C] to-[#042C45]",
    accentColor: "#FFD935"
  }
];

export function ScrollStackAdvanced() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth spring animation for better feel
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[600vh] py-20"
    >
      {/* Sticky container for cards - matches Purpose Talent's approach */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-3xl">
          {cards.map((card, index) => (
            <ScrollCard
              key={card.id}
              card={card}
              index={index}
              totalCards={cards.length}
              scrollProgress={smoothProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ScrollCardProps {
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
  scrollProgress: any;
}

function ScrollCard({ card, index, totalCards, scrollProgress }: ScrollCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Calculate the progress for this specific card
  const cardProgress = useTransform(scrollProgress, (value) => {
    const progress = value * (totalCards - 1) - index;
    return Math.max(0, Math.min(1, progress));
  });

  // Purpose Talent-style stacking with more refined curves
  const scale = useTransform(cardProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(cardProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const y = useTransform(cardProgress, [0, 0.5, 1], [80, 0, -80]);
  const rotate = useTransform(cardProgress, [0, 0.5, 1], [3, 0, -3]);
  
  // Z-index ensures proper stacking order
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
          scale,
          opacity,
          y,
          rotate,
          zIndex,
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
