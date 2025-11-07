'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CardItem } from './CardItem';

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

export function StackedCards() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // More precise scroll progress calculation for smoother transitions
  const cardProgress = useTransform(scrollYProgress, [0, 1], [0, cards.length - 1]);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-[600vh] py-20"
    >
      {/* Sticky container for cards - matches Purpose Talent's approach */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-3xl">
          {cards.map((card, index) => (
            <CardItem
              key={card.id}
              card={card}
              index={index}
              totalCards={cards.length}
              scrollProgress={cardProgress}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
