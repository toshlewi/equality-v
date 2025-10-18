'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Briefcase, Heart, Globe } from 'lucide-react';

export default function JobsVolunteerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-br from-[#042C45] to-[#FF7D05] text-white py-16 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/get-involved"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 font-league-spartan"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Get Involved
          </Link>
          
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 font-fredoka"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Jobs & Volunteer
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-league-spartan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join our team or volunteer your time. Be part of the change you want to see.
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.section 
        className="py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Current Opportunities */}
          <div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-[#042C45] mb-6 font-fredoka"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Current Opportunities
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 font-league-spartan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              We&apos;re always looking for passionate individuals to join our movement
            </motion.p>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Volunteer Opportunities */}
            <motion.div
              className="bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90 p-8 rounded-2xl text-[#042C45]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <div className="flex items-center mb-6">
                <Heart className="w-8 h-8 mr-4" />
                <h3 className="text-2xl font-bold font-fredoka">Volunteer Opportunities</h3>
              </div>
              <ul className="space-y-3 mb-6 font-league-spartan">
                <li>• Event coordination and support</li>
                <li>• Content creation and social media</li>
                <li>• Research and advocacy support</li>
                <li>• Community outreach and engagement</li>
                <li>• Translation and language support</li>
              </ul>
              <p className="text-sm opacity-80 font-league-spartan">
                Flexible time commitment, remote and in-person options available
              </p>
            </motion.div>

            {/* Job Opportunities */}
            <motion.div
              className="bg-gradient-to-br from-[#66623C] to-[#66623C]/90 p-8 rounded-2xl text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              <div className="flex items-center mb-6">
                <Briefcase className="w-8 h-8 mr-4" />
                <h3 className="text-2xl font-bold font-fredoka">Job Opportunities</h3>
              </div>
              <ul className="space-y-3 mb-6 font-league-spartan">
                <li>• Communications Manager</li>
                <li>• Program Coordinator</li>
                <li>• Legal Research Assistant</li>
                <li>• Digital Marketing Specialist</li>
                <li>• Community Engagement Officer</li>
              </ul>
              <p className="text-sm opacity-80 font-league-spartan">
                Full-time and part-time positions available
              </p>
            </motion.div>
          </div>

          {/* Why Join Us */}
          <motion.div
            className="bg-gray-50 rounded-2xl p-12 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <h3 className="text-3xl font-bold text-[#042C45] mb-8 text-center font-fredoka">
              Why Join Equality Vanguard?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe className="w-12 h-12" />,
                  title: "Make Real Impact",
                  description: "Work on meaningful projects that advance gender justice and equality across Africa"
                },
                {
                  icon: <Users className="w-12 h-12" />,
                  title: "Join a Community",
                  description: "Be part of a supportive, passionate community of changemakers and activists"
                },
                {
                  icon: <Heart className="w-12 h-12" />,
                  title: "Grow Your Skills",
                  description: "Develop new skills, gain experience, and build your professional network"
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-[#042C45] mb-4 flex justify-center">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-semibold text-[#042C45] mb-3 font-fredoka">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 font-league-spartan">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Application Process */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <h3 className="text-3xl font-bold text-[#042C45] mb-6 font-fredoka">
              How to Apply
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                "Send us your CV and cover letter",
                "Tell us about your passion for gender justice",
                "We'll get back to you within 2 weeks"
              ].map((step, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#F9D960] text-[#042C45] rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <span className="font-league-spartan">{step}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <p className="text-lg text-gray-600 font-league-spartan">
                Ready to join our team?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="px-8 py-4 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan"
                >
                  Apply Now
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-[#042C45] text-[#042C45] rounded-lg hover:bg-[#042C45] hover:text-white transition-colors font-league-spartan"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
