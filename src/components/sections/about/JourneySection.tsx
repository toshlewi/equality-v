'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function JourneySection() {
  const handleDownloadManifesto = () => {
    const link = document.createElement('a');
    link.href = '/files/manifesto.pdf';
    link.download = 'Equality-Vanguard-Manifesto.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="journey" className="relative min-h-screen flex items-center bg-gradient-to-br from-brand-teal/5 to-brand-orange/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-yellow rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-orange rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-teal rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/place1 (19).jpg"
                alt="The Journey - Equality Vanguard"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-fredoka text-5xl lg:text-6xl font-bold text-brand-teal leading-tight"
            >
              Our Journey
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-spartan text-lg lg:text-xl text-gray-700 leading-relaxed"
            >
              The ordinary meaning of the word Equality connotes fairness, parity, and the absence of discrimination. Vanguard, in its plain and legal sense, refers to those positioned at the forefront of a movement, pioneers who assume the duty of ushering in change.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="font-spartan text-lg lg:text-xl text-gray-700 leading-relaxed"
            >
              Combined, Equality Vanguard embodies a conscious declaration: to stand at the frontlines of justice, to articulate the silenced, and to advance the cause of substantive equality.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                href="/about/journey"
                className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105 text-center"
              >
                Read Our Journey
              </Link>
              
              <button 
                onClick={handleDownloadManifesto}
                className="btn-secondary text-lg px-8 py-4 hover:bg-brand-teal hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Download Manifesto
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

