'use client';

import { motion } from 'framer-motion';

export function PageHeader() {
  return (
    <motion.header 
      className="relative bg-gradient-to-br from-[#042C45] to-[#042C45]/90 text-white py-16 px-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 font-fredoka"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Get Involved
        </motion.h1>
        <motion.p 
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-league-spartan"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Join our movement for gender justice, equality, and transformative change. 
          Choose how you want to make a difference.
        </motion.p>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#F9D960]/10 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-[#FF7D05]/10 rounded-full"></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-[#66623C]/10 rounded-full"></div>
      </div>
    </motion.header>
  );
}

