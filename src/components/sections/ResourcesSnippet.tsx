'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function ResourcesSnippet() {
  const resources = [
    {
      type: 'Articles',
      title: 'Digital Rights & Gender Justice',
      description: 'Exploring the intersection of technology and women\'s rights in Africa',
      image: '/images/hero-3.png',
      link: '/our-voices'
    },
    {
      type: 'Videos',
      title: 'Our Voices Documentary',
      description: 'Stories of resilience and resistance from across the continent',
      image: '/images/place1 (4).jpg',
      link: '/our-voices'
    },
    {
      type: 'Podcasts & Audio',
      title: 'ALKAH Book Club Sessions',
      description: 'Deep conversations on feminist literature and Pan-African thought',
      image: '/images/place1 (5).jpg',
      link: '/our-voices'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Our Resources
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of articles, videos, and audio content that amplify voices and advance justice
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <Link key={resource.type} href={resource.link}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={resource.image}
                    alt={resource.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3">
                    {resource.title}
                  </h3>
                  
                  <p className="font-spartan text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  
                  <div className="text-sm font-semibold text-brand-orange group-hover:text-brand-teal transition-colors duration-300">
                    Explore {resource.type} →
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
