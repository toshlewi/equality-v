'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';

export default function BuyMerchPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        className="bg-gradient-to-br from-[#042C45] to-[#042C45]/90 text-white py-16 px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/get-involved"
            className="inline-flex items-center text-[#F9D960] hover:text-[#F9D960]/80 transition-colors mb-8 font-league-spartan"
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
              Your New Favorite Feminist Everything
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-league-spartan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Show your support with our feminist merchandise. Wear your values proudly.
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Coming Soon Section */}
      <motion.section 
        className="py-20 px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="mb-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="w-32 h-32 bg-gradient-to-br from-[#F9D960] to-[#FF7D05] rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-[#042C45] mb-6 font-fredoka"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Coming Soon
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-600 mb-12 font-league-spartan"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            We&apos;re curating an amazing collection of feminist merchandise that aligns with our values. 
            Stay tuned for t-shirts, mugs, books, and more!
          </motion.p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Ethically Made",
                description: "All products are ethically sourced and made with sustainable materials"
              },
              {
                icon: <ShoppingBag className="w-8 h-8" />,
                title: "Feminist Design",
                description: "Unique designs that celebrate feminist values and African heritage"
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Support the Movement",
                description: "Proceeds directly support our gender justice initiatives"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-gray-50 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
              >
                <div className="text-[#042C45] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#042C45] mb-3 font-fredoka">
                  {feature.title}
                </h3>
                <p className="text-gray-600 font-league-spartan">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <p className="text-lg text-gray-600 font-league-spartan">
              Want to be notified when we launch?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-involved"
                className="px-8 py-4 bg-[#042C45] text-white rounded-lg hover:bg-[#042C45]/90 transition-colors font-league-spartan"
              >
                Join Our Community
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-[#042C45] text-[#042C45] rounded-lg hover:bg-[#042C45] hover:text-white transition-colors font-league-spartan"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
