'use client';
import { motion } from 'framer-motion';

export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#042c45]/15 to-[#042c45]/25"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#042c45] rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#042c45] rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#042c45] rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#042c45] rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-[#042c45] rounded-full blur-lg"></div>
      </div>
      
      {/* Wavy bands overlay */}
      <div className="absolute inset-0">
        {/* Band 1 */}
        <motion.div
          className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#042c45]/40 to-[#042c45]/50"
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
          className="absolute top-20 left-0 w-full h-40 bg-gradient-to-r from-[#042c45]/30 to-[#042c45]/40"
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
          className="absolute top-40 left-0 w-full h-36 bg-gradient-to-r from-[#042c45]/35 to-[#042c45]/45"
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
          className="absolute top-60 left-0 w-full h-44 bg-gradient-to-r from-[#042c45]/30 to-[#042c45]/40"
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
          className="absolute top-80 left-0 w-full h-32 bg-gradient-to-r from-[#042c45]/40 to-[#042c45]/50"
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
