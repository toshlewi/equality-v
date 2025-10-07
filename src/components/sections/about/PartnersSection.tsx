'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const partnerLogos = [
  { name: 'Partner 1', logo: '/images/place1 (11).jpg' },
  { name: 'Partner 2', logo: '/images/place1 (12).jpg' },
  { name: 'Partner 3', logo: '/images/place1 (13).jpg' },
  { name: 'Partner 4', logo: '/images/place1 (14).jpg' },
  { name: 'Partner 5', logo: '/images/place1 (15).jpg' },
  { name: 'Partner 6', logo: '/images/place1 (16).jpg' },
  { name: 'Partner 7', logo: '/images/place1 (17).jpg' },
  { name: 'Partner 8', logo: '/images/place1 (18).jpg' },
];

export default function PartnersSection() {
  return (
    <section id="partners" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Partners & Networks
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-3xl mx-auto">
            At Equality Vanguard, we believe collaboration is at the heart of lasting change. We are proud to stand alongside visionary organizations, networks, and communities that share our commitment to justice, liberation, and transformative change. Together, we amplify voices, pool resources, and drive impact across Africa and beyond.
          </p>
        </motion.div>

        {/* Partnership Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3">
                Co-create Programs
              </h3>
              <p className="font-spartan text-gray-600">
                Co-create programs and campaigns advancing gender justice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3">
                Share Knowledge
              </h3>
              <p className="font-spartan text-gray-600">
                Share knowledge, tools, and expertise to strengthen movements.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3">
                Build Networks
              </h3>
              <p className="font-spartan text-gray-600">
                Build solidarity networks that connect communities across borders.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Logo Loop Animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16 py-12 rounded-2xl"
          style={{ backgroundColor: '#042C45' }}
        >
          <div className="relative overflow-hidden">
            <motion.div
              className="flex space-x-8"
              animate={{
                x: [0, -100 * partnerLogos.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {/* Duplicate logos for seamless loop */}
              {[...partnerLogos, ...partnerLogos].map((partner, index) => (
                <motion.div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 w-32 h-32 relative group"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-full h-full bg-white rounded-lg shadow-md flex items-center justify-center p-4 group-hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={80}
                      height={80}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-spartan text-lg text-gray-600 mb-8">
            Our collective impact is proof that change is strongest when we work together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-involved"
              className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Volunteer / Jobs
            </Link>
            <Link
              href="/get-involved"
              className="btn-secondary text-lg px-8 py-4 hover:bg-brand-teal hover:text-white transition-all duration-300 transform hover:scale-105"
            >
              Partner with Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

