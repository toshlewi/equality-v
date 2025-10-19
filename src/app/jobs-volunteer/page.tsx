'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, Briefcase, Heart, Globe, Mail, UserPlus } from 'lucide-react';

export default function JobsVolunteerPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="bg-[#FF7D05] text-white py-16 px-4"
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
              Join our movement for gender justice, equality, and transformative change.
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
        <div className="max-w-4xl mx-auto">
          {/* No Open Positions Message */}
          <motion.div
            className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
            <div className="bg-gradient-to-br from-[#F9D960] to-[#F9D960]/90 rounded-2xl p-12 mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[#042C45] rounded-full flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#042C45] mb-6 font-fredoka">
                No Open Positions at the Moment
              </h2>
              <p className="text-lg text-[#042C45]/80 font-league-spartan max-w-2xl mx-auto">
                We&apos;re not currently hiring, but we&apos;re always growing our community of changemakers. 
                Stay connected with us to be the first to know when opportunities arise.
              </p>
            </div>
          </motion.div>

          {/* Join the Sisterhood Section */}
          <motion.div
            className="bg-gradient-to-br from-[#042C45] to-[#042C45]/90 rounded-2xl p-12 mb-16 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[#F9D960] rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-[#042C45]" />
          </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 font-fredoka">
                Join the Sisterhood
              </h3>
              <p className="text-lg text-white/90 font-league-spartan max-w-2xl mx-auto mb-8">
                Become part of our vibrant community of feminists, activists, and changemakers. 
                Together, we&apos;re building a more just and equal world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/get-involved"
                  className="px-8 py-4 bg-[#F9D960] text-[#042C45] rounded-lg hover:bg-[#F9D960]/90 transition-colors font-league-spartan font-semibold inline-flex items-center"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Join Our Community
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#042C45] transition-colors font-league-spartan"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
            </motion.div>

          {/* Newsletter Signup Section */}
            <motion.div
            className="bg-gray-50 rounded-2xl p-12 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-[#FF7D05] rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-[#042C45] mb-6 font-fredoka">
                Stay in the Loop
              </h3>
              <p className="text-lg text-gray-600 font-league-spartan max-w-2xl mx-auto mb-8">
                Sign up for our newsletter to get notified when new positions open up, 
                learn about upcoming events, and stay connected with our community.
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042C45] focus:border-transparent font-league-spartan"
                  />
                  <button className="px-8 py-3 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan font-semibold">
                    Subscribe
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-4 font-league-spartan">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
            </motion.div>

          {/* Why Join Us */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <h3 className="text-3xl font-bold text-[#042C45] mb-8 font-fredoka">
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
        </div>
      </motion.section>
    </div>
  );
}
