'use client';

import { motion } from 'framer-motion';
import WorkPageLayout from '@/components/layout/WorkPageLayout';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Shield, Users } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const comingSoonFeatures = [
  {
    icon: Heart,
    title: "Mental Health Support",
    description: "Comprehensive mental health resources and support systems for our community members."
  },
  {
    icon: Brain,
    title: "Wellness Programs",
    description: "Evidence-based wellness programs designed specifically for activists and changemakers."
  },
  {
    icon: Shield,
    title: "Safe Spaces",
    description: "Creating safe, confidential spaces for mental health discussions and healing."
  },
  {
    icon: Users,
    title: "Community Care",
    description: "Building a community of care where members support each other's mental wellbeing."
  }
];

export default function MentalHealthPage() {
  return (
    <WorkPageLayout
      title="Mental Health"
      subtitle="Coming Soon - Comprehensive mental health support and advocacy initiatives"
      heroImage="/images/mental-health.jpeg"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-16"
      >
        {/* Coming Soon Hero */}
        <motion.section variants={fadeInUp} className="relative text-center bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl p-16 text-white overflow-hidden">
          {/* Coming Soon Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 to-brand-yellow/20 rounded-2xl"
          />
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-white/30 transition-colors duration-300">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <motion.h2 
              className="text-4xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Coming Soon
            </motion.h2>
            <motion.p 
              className="text-xl lg:text-2xl leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              We're building something powerful - a comprehensive mental health initiative that recognizes the unique challenges faced by activists, advocates, and changemakers in our community.
            </motion.p>
            <motion.div 
              className="bg-white/10 rounded-xl p-6 max-w-2xl mx-auto hover:bg-white/20 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <p className="text-lg">
                "Taking care of yourself is not selfish. It's essential for the work we do and the communities we serve."
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* What We're Building */}
        <motion.section variants={fadeInUp}>
          <h3 className="text-3xl font-bold text-brand-teal mb-8 text-center">What We're Building</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center"
              >
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-brand-teal" />
                </div>
                <h4 className="text-xl font-semibold text-brand-teal mb-3">{feature.title}</h4>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Why Mental Health Matters */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">Why Mental Health Matters in Our Work</h3>
            <p className="text-xl leading-relaxed mb-8">
              The work of dismantling oppression and building justice is emotionally demanding. Activists, advocates, and changemakers often face burnout, trauma, and mental health challenges that can impact their ability to continue the important work they do.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-3">Recognition</h4>
                <p className="text-white/90">We recognize that mental health is not separate from our work for justice - it's fundamental to it.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-3">Support</h4>
                <p className="text-white/90">We're committed to providing the support our community needs to thrive in their advocacy work.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stay Updated */}
        <motion.section variants={fadeInUp} className="bg-white rounded-2xl p-12 shadow-lg text-center">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Stay Updated</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Want to be the first to know when our mental health initiatives launch? Join our community and we'll keep you informed about this important work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
            >
              Join Our Community
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white px-8 py-4 text-lg"
            >
              Get Updates
            </Button>
          </div>
        </motion.section>

        {/* Support Statement */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-12 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">You Are Not Alone</h3>
            <p className="text-xl leading-relaxed mb-8">
              While we work on building comprehensive mental health support, remember that you are not alone in this journey. The work we do is important, and so is taking care of yourself.
            </p>
            <div className="bg-white/10 rounded-xl p-6">
              <p className="text-lg">
                "The revolution we labour for is not a fleeting season's harvest but the slow, deliberate planting of seeds in soil long denied its rain. We who stand in the Vanguard know that the fruits may ripen beyond our lifetime, yet still, we till, we water, we write, we litigate, because the measure of our calling is not in immediacy but in fidelity to the struggle."
              </p>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Be Part of Our Mental Health Journey</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            As we build this important initiative, we want to hear from you. What mental health support would be most valuable to you? How can we better support our community's wellbeing?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
            >
              Share Your Thoughts
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white px-8 py-4 text-lg"
            >
              Join Our Community
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </WorkPageLayout>
  );
}
