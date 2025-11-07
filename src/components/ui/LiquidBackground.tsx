'use client';
import { motion } from 'framer-motion';

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FFD935]/15 to-[#FF7D05]/25"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFD935] rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FFD935] rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD935] rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#FFD935] rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-[#FFD935] rounded-full blur-lg"></div>
      </div>
      
      {/* SVG Filter for liquid effect */}
      <svg className="absolute inset-0 w-full h-full" style={{ filter: 'url(#liquidFilter)' }}>
        <defs>
          <filter id="liquidFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="liquid" />
            <feComposite in="SourceGraphic" in2="liquid" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Liquid Blob 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-80"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD935 50%, #FF7D05 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.2, 0.8, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Liquid Blob 2 */}
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-70"
        style={{
          background: 'linear-gradient(45deg, #FFD935 0%, #FFFFFF 50%, #FF7D05 100%)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -60, 0],
          scale: [1, 0.7, 1.3, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Liquid Blob 3 */}
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-60"
        style={{
          background: 'linear-gradient(225deg, #FFFFFF 0%, #FFD935 50%, #FF7D05 100%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 100% 40%, 100% 60%, 60% 100%, 40% 100%, 0% 60%, 0% 40%)',
        }}
        animate={{
          x: [0, 150, -100, 0],
          y: [0, -120, 80, 0],
          scale: [1, 1.4, 0.6, 1],
          rotate: [0, 90, 270, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Liquid Blob 4 */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-50"
        style={{
          background: 'linear-gradient(315deg, #FFD935 0%, #FFFFFF 30%, #FF7D05 70%, #FFD935 100%)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
        }}
        animate={{
          x: [0, -80, 120, 0],
          y: [0, 140, -90, 0],
          scale: [1, 0.8, 1.2, 1],
          rotate: [0, -90, 90, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Liquid Blob 5 */}
      <motion.div
        className="absolute w-56 h-56 rounded-full opacity-45"
        style={{
          background: 'linear-gradient(180deg, #FFD935 0%, #FF7D05 50%, #FFFFFF 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 100% 35%, 100% 65%, 65% 100%, 35% 100%, 0% 65%, 0% 35%)',
        }}
        animate={{
          x: [0, 90, -70, 0],
          y: [0, -100, 120, 0],
          scale: [1, 1.1, 0.9, 1],
          rotate: [0, 270, 90, 360],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Liquid Blob 6 */}
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-40"
        style={{
          background: 'linear-gradient(270deg, #FFFFFF 0%, #FFD935 50%, #FF7D05 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
        animate={{
          x: [0, -60, 90, 0],
          y: [0, 110, -80, 0],
          scale: [1, 0.9, 1.1, 1],
          rotate: [0, 180, 360, 540],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Additional smaller blobs for depth */}
      <motion.div
        className="absolute w-32 h-32 rounded-full opacity-35"
        style={{
          background: 'linear-gradient(135deg, #FFD935 0%, #FF7D05 100%)',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
        }}
        animate={{
          x: [0, 200, -150, 0],
          y: [0, -150, 200, 0],
          scale: [1, 1.5, 0.5, 1],
          rotate: [0, 360, 720],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute w-24 h-24 rounded-full opacity-25"
        style={{
          background: 'linear-gradient(45deg, #FFD935 0%, #FF7D05 100%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 100% 40%, 100% 60%, 60% 100%, 40% 100%, 0% 60%, 0% 40%)',
        }}
        animate={{
          x: [0, -200, 180, 0],
          y: [0, 180, -200, 0],
          scale: [1, 0.6, 1.4, 1],
          rotate: [0, -360, -720],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle overlay for better content readability */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]"></div>
    </div>
  );
}
