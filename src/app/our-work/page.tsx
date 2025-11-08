'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import WorkCard from '@/components/ui/WorkCard';

const workAreas = [
  {
    id: 'digital-rights',
    title: 'Digital Rights',
    description: 'Creating safe spaces for women in virtual environments and championing digital justice.',
    image: '/images/hero-10.jpeg',
    href: '/our-work/digital-rights',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'srhr',
    title: 'SRHR',
    description: 'Sexual and Reproductive Health and Rights advocacy for bodily autonomy and dignity.',
    image: '/images/hero-13.jpeg',
    href: '/our-work/srhr',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'economic-justice',
    title: 'Economic Justice',
    description: 'Challenging neoliberal frameworks and advocating for feminist economic alternatives.',
    image: '/images/hero-14.jpeg',
    href: '/our-work/economic-justice',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'alkah-book-club',
    title: 'ALKAH Book Club',
    description: 'Feminist literature space where knowledge moves from theory to praxis through transformative reading.',
    image: '/images/place 25.jpeg',
    href: '/our-work/alkah-book-club',
    color: 'from-purple-500 to-violet-500',
    specialCta: 'Explore the Book Library'
  },
  {
    id: 'legal-vanguard',
    title: 'Legal Vanguard',
    description: 'A community of legal minds working to decolonize legal thought and shape inclusive policy.',
    image: '/images/place 27.jpeg',
    href: '/our-work/legal-vanguard',
    color: 'from-[#042c45] to-[#042c45]/80',
    specialCta: 'Join the Legal Vanguard'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function OurWorkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Container className="py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-teal mb-6">
            Our Work
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
            At Equality Vanguard, we fuse legal advocacy with creative expression to dismantle oppression 
            and reimagine justice. Our work spans multiple interconnected areas, each contributing to our 
            vision of a more just and equitable world.
          </p>
        </motion.div>

        {/* Work Areas Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {workAreas.map((area, index) => (
            <WorkCard
              key={area.id}
              id={area.id}
              title={area.title}
              description={area.description}
              image={area.image}
              href={area.href}
              color={area.color}
              specialCta={area.specialCta}
              index={index}
            />
          ))}
        </motion.div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16 md:mt-20 bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-teal mb-4 sm:mb-6">
            Ready to Join Our Movement?
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Whether you're interested in legal advocacy, creative expression, or community building, 
            there's a place for you in our collective.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved#membership">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              >
                Join Our Community
              </Button>
            </Link>
            <Link href="/get-involved#donate">
              <Button 
                size="lg" 
                variant="outline"
                className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white px-8 py-4 text-lg"
              >
                Support Our Work
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
