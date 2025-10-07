'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function KnowledgePortalSnippet() {
  const publications = [
    {
      type: 'Blog',
      title: 'Digital Health Rights in Africa',
      author: 'Dr. Sarah Mwangi',
      date: 'Dec 15, 2024',
      image: '/images/place1 (6).jpg'
    },
    {
      type: 'Article',
      title: 'Economic Justice & Women\'s Labor',
      author: 'Prof. Aisha Hassan',
      date: 'Dec 10, 2024',
      image: '/images/place1 (7).jpg'
    },
    {
      type: 'Publication',
      title: 'SRHR Policy Framework 2024',
      author: 'Equality Vanguard Research Team',
      date: 'Dec 5, 2024',
      image: '/images/place1 (8).jpg'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Knowledge Portal
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            Access our latest research, publications, and resources on gender justice and Pan-African feminism
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {publications.map((publication, index) => (
            <Link key={publication.title} href="/knowledge-portal">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={publication.image}
                    alt={publication.title}
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="font-fredoka text-xl font-bold text-brand-teal group-hover:text-brand-orange transition-colors duration-300">
                    {publication.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600">
                    <div>By {publication.author}</div>
                    <div>{publication.date}</div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link 
            href="/our-voices"
            className="btn-secondary text-lg px-8 py-4 hover:bg-brand-teal hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Explore Our Voices
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
