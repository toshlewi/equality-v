'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-white via-[#FFD935]/15 to-[#FF7D05]/25 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#FFD935] rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#FFD935] rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFD935] rounded-full blur-2xl"></div>
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#FFD935] rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/3 w-36 h-36 bg-[#FFD935] rounded-full blur-lg"></div>
      </div>

      {/* Moving Liquid Blobs - Furthest Right Corner */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 overflow-hidden">
        {/* Liquid Blob 1 */}
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-35"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD935 50%, #FF7D05 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
          }}
          animate={{
            x: [0, 50, -25, 0],
            y: [0, -40, 30, 0],
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
          className="absolute w-80 h-80 rounded-full opacity-25"
          style={{
            background: 'linear-gradient(45deg, #FFD935 0%, #FFFFFF 50%, #FF7D05 100%)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          }}
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -30, 0],
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
          className="absolute w-72 h-72 rounded-full opacity-20"
          style={{
            background: 'linear-gradient(225deg, #FFFFFF 0%, #FFD935 50%, #FF7D05 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 40%, 100% 60%, 60% 100%, 40% 100%, 0% 60%, 0% 40%)',
          }}
          animate={{
            x: [0, 75, -50, 0],
            y: [0, -60, 40, 0],
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
          className="absolute w-64 h-64 rounded-full opacity-15"
          style={{
            background: 'linear-gradient(315deg, #FFD935 0%, #FFFFFF 30%, #FF7D05 70%, #FFD935 100%)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
          }}
          animate={{
            x: [0, -40, 60, 0],
            y: [0, 70, -45, 0],
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
          className="absolute w-56 h-56 rounded-full opacity-12"
          style={{
            background: 'linear-gradient(180deg, #FFD935 0%, #FF7D05 50%, #FFFFFF 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 35%, 100% 65%, 65% 100%, 35% 100%, 0% 65%, 0% 35%)',
          }}
          animate={{
            x: [0, 45, -35, 0],
            y: [0, -50, 60, 0],
            scale: [1, 1.1, 0.9, 1],
            rotate: [0, 270, 90, 360],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Additional smaller blobs for depth */}
        <motion.div
          className="absolute w-32 h-32 rounded-full opacity-10"
          style={{
            background: 'linear-gradient(135deg, #FFD935 0%, #FF7D05 100%)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          }}
          animate={{
            x: [0, 100, -75, 0],
            y: [0, -75, 100, 0],
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
          className="absolute w-24 h-24 rounded-full opacity-8"
          style={{
            background: 'linear-gradient(45deg, #FFD935 0%, #FF7D05 100%)',
            clipPath: 'polygon(40% 0%, 60% 0%, 100% 40%, 100% 60%, 60% 100%, 40% 100%, 0% 60%, 0% 40%)',
          }}
          animate={{
            x: [0, -100, 90, 0],
            y: [0, 90, -100, 0],
            scale: [1, 0.6, 1.4, 1],
            rotate: [0, -360, -720],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
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
              <Link href="/get-involved">
                <button className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105">
                  Join the Movement
                </button>
              </Link>
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
