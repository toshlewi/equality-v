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

export default function DigitalRightsPage() {
  return (
    <WorkPageLayout
      title="Digital Rights"
      subtitle="Creating safe spaces for women in virtual environments and championing digital justice"
      heroImage="/images/raised fist.jpeg"
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
          <h2 className="text-3xl font-bold text-brand-teal mb-6">Our Digital Rights Work</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            One of the guiding tenets at Equality Vanguard is the cardinal belief and endeavor to create safe spaces for women, everywhere, virtual spaces included. We continue to action the same through the creation of spaces and platforms where members of our community are able to freely share and tap into each other's experiences, narratives and resources in a manner compliant with their overriding right to privacy.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Additionally, any data so garnered is solely collected and used upon the full consent and approval of members. Over and above the aforementioned, the Legal Vanguard continues to make great strides in championing conversations on Digital Justice and safeguarding online freedoms.
          </p>
        </motion.section>

        {/* Key Areas */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-teal mb-4">Safe Digital Spaces</h3>
            <p className="text-gray-700 leading-relaxed">
              We create and maintain secure platforms where women can freely share experiences, access resources, and build community without fear of harassment or data misuse.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-brand-teal mb-4">Privacy Protection</h3>
            <p className="text-gray-700 leading-relaxed">
              All data collection follows strict consent protocols, ensuring our community members have full control over their personal information and digital footprint.
            </p>
          </div>
        </motion.section>

        {/* Legal Advocacy */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">Legal Vanguard Digital Justice</h3>
            <p className="text-xl leading-relaxed mb-8">
              Our Legal Vanguard team leads conversations on digital justice, working to ensure that online freedoms are protected and that women's rights extend seamlessly into digital spaces.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/our-work/legal-vanguard">
                <Button 
                  size="lg" 
                  className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                >
                  Learn About Legal Vanguard
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-teal"
              >
                Join Our Community
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Ready to Join Our Digital Rights Movement?</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Whether you're interested in digital privacy, online safety, or legal advocacy for digital rights, there's a place for you in our collective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
            >
              Get Involved
            </Button>
          </div>
        </motion.section>
      </motion.div>
    </WorkPageLayout>
  );
}
