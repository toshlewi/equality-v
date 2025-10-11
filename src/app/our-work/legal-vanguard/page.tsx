'use client';

import { motion, AnimatePresence } from 'framer-motion';
import WorkPageLayout from '@/components/layout/WorkPageLayout';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';

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

const legalTeam = [
  {
    name: "Mutheu Mutuku",
    role: "Visionary Founder & Creative Director",
    image: "/images/place1 (12).jpg",
    bio: "A highly accomplished human rights lawyer focused on the intricate connections between gender justice, feminist macroeconomics, and climate justice. She possesses a remarkable ability to translate complex legal principles into tangible, public-facing initiatives."
  },
  {
    name: "Melvin Bosibori",
    role: "Policy and Advocacy Weaver",
    image: "/images/amelvin.jpg",
    bio: "A lawyer and Advocate in training passionate about the intersection of law and technology. With certification in Data Protection, she explores how emerging issues around privacy, digital rights and online governance affect people, particularly women."
  },
  {
    name: "Purity Buyanzi",
    role: "Feminist Justice Scribe",
    image: "/images/abuyanzi.jpg",
    bio: "The Feminist Justice Scribe at Equality Vanguard and currently a Trainee Advocate at the Kenya School of Law. She brings expertise in feminist legal writing, research, and editorial work to lead our development of feminist research and advocacy content."
  }
];

const ruthKamandeImages = [
  {
    src: "/images/rkc1.png",
    alt: "Ruth Kamande case documentation 1",
    caption: "Ruth Kamande case documentation - Legal advocacy in action"
  },
  {
    src: "/images/rkc2.png",
    alt: "Ruth Kamande case documentation 2",
    caption: "Legal Vanguard team working on transformative legal initiatives"
  },
  {
    src: "/images/rkc3.png",
    alt: "Ruth Kamande case documentation 3",
    caption: "Documenting landmark legal advocacy efforts"
  },
  {
    src: "/images/rkc4.png",
    alt: "Ruth Kamande case documentation 4",
    caption: "Legal Vanguard community engagement and advocacy"
  },
  {
    src: "/images/rkc5.png",
    alt: "Ruth Kamande case documentation 5",
    caption: "Transformative legal work in progress"
  },
  {
    src: "/images/rkc6.png",
    alt: "Ruth Kamande case documentation 6",
    caption: "Legal Vanguard impact and community building"
  }
];

export default function LegalVanguardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <WorkPageLayout
      title="Legal Vanguard"
      subtitle="A community of legal minds working to decolonize legal thought and shape inclusive policy"
      heroImage="/images/legal hero.jpeg"
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
          <h2 className="text-3xl font-bold text-brand-teal mb-6">Our Legal Work</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At the heart of our mission is a commitment to justice, dignity and equality. We believe that justice exists only where everyone has access to it. Through our legal justice initiatives, we work to bridge the gap between women and the protections they deserve.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            We champion initiatives that bring the law closer to the people. From community legal aid programs to capacity-building workshops, we make legal knowledge accessible, practical and actionable. We also identify gaps in existing laws and avenues we can take to make them more inclusive.
          </p>
        </motion.section>

        {/* Legal Vanguard Community */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">The Legal Vanguard Community</h3>
            <p className="text-xl leading-relaxed mb-8">
              The Legal Vanguard Community is a community where lawyers and law students come together to learn, advocate and co-create solutions for some of the gaps and challenges in the evolving legal landscape. It is a gathering place for legal minds who choose to read the law as living instrument, capable of remedy as much as harm.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              Here, statutes and precedents are interrogated through feminist, decolonial, and climate justice lenses; here, knowledge is exchanged on land rights, extractives, registration processes, academic writing, and the provision of legal aid as the need may arise. A network of lawyers and jurists intend on decolonizing legal thought, unsettling the inherited silences of jurisprudence, and shaping policy that reflects the realities of those it purports to govern.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
              >
                Join the Legal Vanguard
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-orange-600"
              >
                Learn More
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Meet the Team */}
        <motion.section variants={fadeInUp}>
          <h3 className="text-3xl font-bold text-brand-teal mb-8 text-center">Meet Our Legal Team</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {legalTeam.map((member, index) => (
              <motion.div
                key={member.name}
                variants={fadeInUp}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-80 bg-gray-200 rounded-lg mb-6 overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={300}
                    height={320}
                    className="w-full h-full object-cover"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <h4 className="text-xl font-bold text-brand-teal mb-2">{member.name}</h4>
                <p className="text-brand-orange font-semibold mb-4">{member.role}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Approach */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-brand-teal mb-6">Our Legal Approach</h3>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Community Legal Aid</h4>
                <p className="text-gray-700">Bringing legal services directly to communities that need them most, ensuring access to justice for all.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Capacity Building</h4>
                <p className="text-gray-700">Training workshops that make legal knowledge accessible, practical and actionable for community members.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Policy Advocacy</h4>
                <p className="text-gray-700">Identifying gaps in existing laws and working to make them more inclusive and responsive to women's needs.</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-brand-teal to-blue-600 rounded-2xl p-8 text-white">
            <h4 className="text-2xl font-bold mb-4">The Legal Vanguard Vision</h4>
            <p className="text-lg leading-relaxed mb-6">
              The Legal Vanguard is, in essence, the reclamation of law as voice, as shield, as remedy. It is a deliberate return to the roots from which Equality Vanguard first drew breath - the belief that law, though imperfect, may be wielded as a tool of transformation.
            </p>
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
            >
              Join Our Legal Community
            </Button>
          </div>
        </motion.section>

        {/* Ruth Kamande Case */}
        <motion.section variants={fadeInUp} className="bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-8 text-center">The Ruth Kamande Case</h3>
          <p className="text-lg text-gray-700 text-center mb-12 max-w-4xl mx-auto">
            Our work on the Ruth Kamande case represents a landmark effort in legal advocacy, demonstrating our commitment to using the law as a tool for justice and transformation. This case showcases how we approach complex legal challenges through feminist and decolonial lenses.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ruthKamandeImages.map((image, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-96 bg-gray-200">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={500}
                    height={384}
                    className="w-full h-full object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-700 text-center text-sm">{image.caption}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Join Legal Vanguard CTA */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-6">Join the Legal Vanguard</h3>
          <p className="text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
            Connect with us and join the Legal Vanguard Community. Whether you're a practicing lawyer, law student, or legal professional, there's a place for you in our network of legal minds committed to decolonizing legal thought and shaping inclusive policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              onClick={() => setIsModalOpen(true)}
            >
              Join the Legal Vanguard
            </Button>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Ready to Transform Legal Practice?</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            The Legal Vanguard is where law meets liberation. Join us in reimagining legal practice as a tool for justice, equity, and transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              onClick={() => setIsModalOpen(true)}
            >
              Join the Legal Vanguard
            </Button>
          </div>
        </motion.section>

        {/* Join Legal Vanguard Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-brand-teal">Join the Legal Vanguard</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-semibold text-brand-teal mb-4">About Legal Vanguard</h4>
                    <p className="text-gray-700 mb-6">
                      The Legal Vanguard Community is a gathering place for legal minds who choose to read the law as living instrument, capable of remedy as much as harm. Here, statutes and precedents are interrogated through feminist, decolonial, and climate justice lenses.
                    </p>
                    <p className="text-gray-700 mb-6">
                      A network of lawyers and jurists intend on decolonizing legal thought, unsettling the inherited silences of jurisprudence, and shaping policy that reflects the realities of those it purports to govern.
                    </p>
                    <div className="space-y-4">
                      <Button className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white">
                        Join Our Community
                      </Button>
                      <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                        Learn More
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src="/images/lvm-1.png"
                        alt="Legal Vanguard team"
                        width={300}
                        height={256}
                        className="w-full h-full object-cover"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    </div>
                    <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src="/images/lvm-2.png"
                        alt="Legal Vanguard community"
                        width={300}
                        height={256}
                        className="w-full h-full object-cover"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </WorkPageLayout>
  );
}
