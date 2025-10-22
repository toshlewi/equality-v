'use client';
import { motion } from 'framer-motion';

export default function MissionVisionSection() {
  return (
    <section id="mission" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Mission & Vision
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            Our guiding principles that drive our commitment to justice and liberation
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-white to-[#042c45]/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-fredoka text-3xl font-bold text-brand-teal mb-6">
                Mission
              </h3>
              <p className="font-spartan text-lg text-gray-700 leading-relaxed">
                Equality Vanguard is dedicated to creating an inclusive society where intersectional, Pan-African feminism drives the realization of Gender Justice.
              </p>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-brand-teal/10 to-brand-brown/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-teal rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-fredoka text-3xl font-bold text-brand-teal mb-6">
                Vision
              </h3>
              <p className="font-spartan text-lg text-gray-700 leading-relaxed">
                We envision a collective where ALL African women, regardless of identity, class, tribe, ability, or sexual orientation, are free from systemic oppression, can exercise their rights, and actively participate in the digital, economic, and social spheres.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

