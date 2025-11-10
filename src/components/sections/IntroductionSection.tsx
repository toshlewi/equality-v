'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function IntroductionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/images/team1.JPG"
                alt="The Journey - From law school to liberation"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-6">
              The Journey
            </h2>
            
            <div className="space-y-4 font-spartan text-lg text-brand-teal leading-relaxed">
              <p>
                The ordinary meaning of the word Equality connotes fairness, parity, and the absence of discrimination. Vanguard, in its plain and legal sense, refers to those positioned at the forefront of a movement, pioneers who assume the duty of ushering in change.
              </p>
              
              <p>
                Combined, Equality Vanguard embodies a conscious declaration: to stand at the frontlines of justice, to articulate the silenced, and to advance the cause of substantive equality.
              </p>
              
              <p>
                The origins of Equality Vanguard are traceable to the precincts of law school, where four of its founding members underwent four years of rigorous legal training. Within those corridors of jurisprudence, it became manifest that the letter of the law, however noble, was often at variance with lived realities.
              </p>
              
              <p className="font-semibold text-brand-orange">
                Why did the law appear progressive on paper, yet oppressive in practice?
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/about" 
                className="inline-flex items-center text-brand-orange font-semibold hover:text-brand-teal transition-colors duration-300"
              >
                Read more about our journey
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
