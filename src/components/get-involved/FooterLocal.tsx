'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function FooterLocal() {
  return (
    <motion.footer 
      className="bg-[#042C45] text-white py-12 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.h3 
          className="text-2xl font-bold mb-4 font-fredoka"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Ready to Make a Difference?
        </motion.h3>
        <motion.p 
          className="text-white/80 mb-8 font-league-spartan"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Every action counts. Every voice matters. Join us in building a more just and equal world.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link 
            href="/about" 
            className="text-[#FFD935] hover:text-[#FFD935]/80 transition-colors font-league-spartan"
          >
            Learn More About Us
          </Link>
          <span className="text-white/40">•</span>
          <Link 
            href="/our-work" 
            className="text-[#FFD935] hover:text-[#FFD935]/80 transition-colors font-league-spartan"
          >
            Our Work
          </Link>
          <span className="text-white/40">•</span>
          <Link 
            href="/contact" 
            className="text-[#FFD935] hover:text-[#FFD935]/80 transition-colors font-league-spartan"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </motion.footer>
  );
}

