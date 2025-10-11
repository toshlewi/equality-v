'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-teal/5 to-brand-orange/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-yellow rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-orange rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-teal rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-fredoka text-5xl lg:text-6xl font-bold text-brand-teal leading-tight"
            >
              Equality Vanguard
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-spartan text-lg lg:text-xl text-gray-700 leading-relaxed"
            >
              Equality Vanguard is a Pan-African feminist collective dismantling oppression through law, art, and radical community. We fuse legal advocacy with creative expression using film, storytelling, music, poetry and more to decolonize knowledge and reimagine justice that is accessible, intersectional, transformative, and rooted in liberation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <button className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105">
                Join the Movement
              </button>
            </motion.div>
          </motion.div>

          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
             <Image
               src="/images/hero-5.png"
               alt="Equality Vanguard - Pan-African feminist collective"
               width={600}
               height={500}
               className="w-full h-auto object-cover"
               priority
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
