'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LatestNewsSnippet() {
  const newsItems = [
    {
      title: 'Equality Vanguard Launches Legal Vanguard Program',
      date: 'December 20, 2024',
      excerpt: 'A new initiative bringing together legal minds to advance gender justice through decolonial legal practice.',
      category: 'Program Launch'
    },
    {
      title: 'ALKAH Book Club: December Session on Sylvia Tamale',
      date: 'December 18, 2024',
      excerpt: 'Join us for a deep dive into "Decolonization and Afrofeminism" and its relevance to contemporary struggles.',
      category: 'Event'
    },
    {
      title: 'New Research: Digital Rights and Women in Kenya',
      date: 'December 15, 2024',
      excerpt: 'Our latest study examines the intersection of technology, privacy, and women\'s rights in digital spaces.',
      category: 'Research'
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
            Latest News & Updates
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about our latest initiatives, research, and community updates
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {newsItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                
                <h3 className="font-fredoka text-xl font-bold text-brand-teal group-hover:text-brand-orange transition-colors duration-300">
                  {item.title}
                </h3>
                
                <p className="font-spartan text-gray-600 leading-relaxed">
                  {item.excerpt}
                </p>
                
                <div className="pt-4">
                  <Link 
                    href="/our-voices" 
                    className="text-brand-orange font-semibold hover:text-brand-teal transition-colors duration-300 inline-flex items-center"
                  >
                    Read more
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
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
            href="/events-news#news"
            className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            See All News
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
