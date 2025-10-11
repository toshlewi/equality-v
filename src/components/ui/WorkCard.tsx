'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WorkCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  color: string;
  specialCta?: string;
  comingSoon?: boolean;
  index: number;
}

export default function WorkCard({ 
  id, 
  title, 
  description, 
  image, 
  href, 
  color, 
  specialCta, 
  comingSoon = false,
  index 
}: WorkCardProps) {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.1
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="group"
    >
      <Link href={href}>
        <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
          <div className="relative h-80 overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
            {comingSoon && (
              <div className="absolute top-4 right-4 bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
            )}
          </div>
          
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-brand-teal group-hover:text-brand-orange transition-colors duration-300">
              {title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {description}
            </p>
            
            <div className="mt-auto">
              {specialCta ? (
                <Button 
                  className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white transition-all duration-300"
                  size="lg"
                >
                  {specialCta}
                </Button>
              ) : comingSoon ? (
                <Button 
                  className="w-full bg-gray-400 text-white cursor-not-allowed"
                  size="lg"
                  disabled
                >
                  Coming Soon
                </Button>
              ) : (
                <Button 
                  className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white transition-all duration-300"
                  size="lg"
                >
                  Learn More
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
