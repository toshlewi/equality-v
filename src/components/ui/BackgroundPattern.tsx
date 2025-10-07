'use client';
import { motion } from 'framer-motion';

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 via-orange-100 to-orange-200"></div>
      
      {/* Wavy bands overlay */}
      <div className="absolute inset-0">
        {/* Band 1 */}
        <motion.div
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-yellow-200/30 to-orange-300/30"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)',
          }}
          animate={{
            x: ['0%', '10%', '0%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Band 2 */}
        <motion.div
          className="absolute top-20 left-0 w-full h-40 bg-gradient-to-r from-orange-200/20 to-yellow-300/20"
          style={{
            clipPath: 'polygon(0 20%, 100% 0, 100% 80%, 0 100%)',
          }}
          animate={{
            x: ['0%', '-15%', '0%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Band 3 */}
        <motion.div
          className="absolute top-40 left-0 w-full h-36 bg-gradient-to-r from-yellow-300/25 to-orange-400/25"
          style={{
            clipPath: 'polygon(0 0, 100% 30%, 100% 100%, 0 70%)',
          }}
          animate={{
            x: ['0%', '12%', '0%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Band 4 */}
        <motion.div
          className="absolute top-60 left-0 w-full h-44 bg-gradient-to-r from-orange-300/20 to-yellow-400/20"
          style={{
            clipPath: 'polygon(0 40%, 100% 0, 100% 60%, 0 100%)',
          }}
          animate={{
            x: ['0%', '-8%', '0%'],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* Band 5 */}
        <motion.div
          className="absolute top-80 left-0 w-full h-32 bg-gradient-to-r from-yellow-400/30 to-orange-500/30"
          style={{
            clipPath: 'polygon(0 0, 100% 20%, 100% 100%, 0 80%)',
          }}
          animate={{
            x: ['0%', '6%', '0%'],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-white/5"></div>
    </div>
  );
}
