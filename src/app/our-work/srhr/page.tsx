'use client';

import { motion } from 'framer-motion';
import WorkPageLayout from '@/components/layout/WorkPageLayout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

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

export default function SRHRPage() {
  return (
    <WorkPageLayout
      title="Sexual and Reproductive Health and Rights"
      subtitle="Centering SRHR as a cornerstone of justice and liberation"
      heroImage="/images/team2.JPG"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-16"
      >
        {/* Introduction */}
        <motion.section variants={fadeInUp} className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-brand-teal mb-6">Our SRHR Advocacy</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Equality Vanguard, we center Sexual and Reproductive Health and Rights (SRHR) as a cornerstone of justice and liberation. Through advocacy campaigns, grassroots community initiatives, and awareness drives, we challenge stigma, expand access, and affirm the right of every person to bodily autonomy and dignity.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We create safe, inclusive spaces where women, girls, and gender-diverse people can share experiences, access resources, and shape solutions. Ensuring that our community is gender diverse is our commitment and central to our vision of justice.
          </p>
        </motion.section>

        {/* Key Areas */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-teal mb-4">Advocacy Campaigns</h3>
            <p className="text-gray-700 leading-relaxed">
              We lead campaigns that challenge stigma and expand access to comprehensive sexual and reproductive health services across communities.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-teal mb-4">Safe Spaces</h3>
            <p className="text-gray-700 leading-relaxed">
              Creating inclusive environments where women, girls, and gender-diverse people can share experiences and access resources without judgment.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-teal mb-4">Policy & Practice</h3>
            <p className="text-gray-700 leading-relaxed">
              Bridging policy and practice through direct engagement with partners, health providers, and community leaders to push for systemic change.
            </p>
          </div>
        </motion.section>

        {/* Creative Expression */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">Fusing Legal Advocacy with Creative Expression</h3>
            <p className="text-xl leading-relaxed mb-8">
              By fusing legal advocacy with creative expression, we ensure SRHR conversations are not only heard and felt through storytelling, art, and collective action. Together, we are building communities where reproductive justice is recognized as fundamental to equality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/our-voices/tell-your-story">
                <Button 
                  size="lg" 
                  className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                >
                  Share Your Story
                </Button>
              </Link>
              <Link href="/our-voices">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-pink-600"
                >
                  Join Our Voices
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Impact */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-brand-teal mb-6">Our Impact</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-brand-teal font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Community Building</h4>
                  <p className="text-gray-700">Creating supportive networks where individuals can access resources and share experiences safely.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-brand-teal font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Awareness & Education</h4>
                  <p className="text-gray-700">Breaking down stigma through creative campaigns and educational initiatives that reach diverse audiences.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-brand-yellow rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-brand-teal font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Systemic Change</h4>
                  <p className="text-gray-700">Working with partners and leaders to create lasting policy changes that protect and advance SRHR.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h4 className="text-2xl font-bold text-brand-teal mb-4">Get Involved</h4>
            <p className="text-gray-700 mb-6">
              Whether you want to share your story, participate in campaigns, or support our advocacy work, there are many ways to get involved.
            </p>
            <div className="space-y-4">
              <Link href="/our-voices/tell-your-story">
                <Button className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white">
                  Share Your Story
                </Button>
              </Link>
              <Link href="/our-voices">
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  Join Our Campaigns
                </Button>
              </Link>
              <Link href="/get-involved#donate">
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  Support Our Work
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Join Our SRHR Movement</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Together, we are building communities where reproductive justice is recognized as fundamental to equality. Your voice and support make this possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              >
                Get Involved
              </Button>
            </Link>
          </div>
        </motion.section>
      </motion.div>
    </WorkPageLayout>
  );
}
