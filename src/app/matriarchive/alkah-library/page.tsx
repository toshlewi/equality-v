"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, 
  Calendar, 
  Users, 
  ArrowRight,
  Library,
  BookMarked,
  MessageSquare,
  Plus
} from "lucide-react";

export default function AlkahLibraryPage() {
  const librarySections = [
    {
      title: "Book Library",
      description: "Explore our curated collection of feminist literature, academic texts, and transformative works.",
      href: "/matriarchive/alkah-library/book-library",
      icon: <Library className="w-8 h-8" />,
      stats: "200+ Books",
      color: "bg-blue-500"
    },
    {
      title: "Books Covered",
      description: "Discover the books we've discussed in our book club sessions with detailed notes and insights.",
      href: "/matriarchive/alkah-library/book-library",
      icon: <BookMarked className="w-8 h-8" />,
      stats: "25+ Discussions",
      color: "bg-green-500"
    },
    {
      title: "Book Club",
      description: "Join our upcoming book club meetings and connect with fellow readers and thinkers.",
      href: "/matriarchive/alkah-library/book-club",
      icon: <MessageSquare className="w-8 h-8" />,
      stats: "Monthly Meetings",
      color: "bg-purple-500"
    },
    {
      title: "Suggest a Book",
      description: "Recommend books for our library and future book club discussions.",
      href: "/matriarchive/alkah-library/suggestion",
      icon: <Plus className="w-8 h-8" />,
      stats: "Share Ideas",
      color: "bg-orange-500"
    }
  ];

  const featuredBooks = [
    {
      title: "Purple Hibiscus",
      author: "Chimamanda Ngozi Adichie",
      year: "2003",
      category: "Fiction",
      description: "A powerful coming-of-age story that explores themes of family, religion, and political awakening in Nigeria.",
      coverImage: "/images/purple-hibiscus.jpeg",
      featured: true
    },
    {
      title: "The Sex Lives of African Women",
      author: "Nana Darkoa Sekyiamah",
      year: "2021",
      category: "Non-Fiction",
      description: "An intimate collection of stories about African women's sexual experiences and liberation.",
      coverImage: "/images/The-sex-lives-of-african women.jpeg",
      featured: true
    },
    {
      title: "Decolonization and Afrofeminism",
      author: "Sylvia Tamale",
      year: "2020",
      category: "Academic",
      description: "A critical examination of decolonization through an Afrofeminist lens.",
      coverImage: "/images/Decolonization-and-afrofeminism.jpeg",
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-white py-20" style={{ backgroundColor: '#042C45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-fredoka text-5xl md:text-6xl font-bold mb-6">
              Alkah Library
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              A transformative space where knowledge becomes alchemy, where silence becomes voice, 
              and where the words of Pan-African foremothers guide our collective journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/matriarchive/alkah-library/book-library"
                className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <BookOpen className="w-5 h-5" />
                <span>Browse Library</span>
              </Link>
              <Link
                href="/matriarchive/alkah-library/suggestion"
                className="border-2 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF7D05';
                  e.currentTarget.style.borderColor = '#FF7D05';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }}
                style={{ borderColor: '#FF7D05' }}
              >
                <Plus className="w-5 h-5" />
                <span>Suggest Book</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Library Sections */}
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
              Explore Our Library
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dive into our comprehensive collection of feminist literature, 
              academic resources, and transformative texts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {librarySections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={section.href}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-l-4 border-brand-yellow h-full">
                    <div className={`w-16 h-16 ${section.color} rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {section.icon}
                    </div>
                    
                    <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors">
                      {section.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {section.stats}
                      </span>
                      <ArrowRight className="w-5 h-5 text-brand-teal group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
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
              Featured Books
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover some of our most impactful and transformative reads
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                  {/* Book Cover */}
                  <div className="relative h-64 bg-gray-200">
                    <img
                      src={book.coverImage}
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {book.featured && (
                      <div className="absolute top-4 right-4 bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Book Details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-brand-teal text-white px-3 py-1 rounded-full text-sm font-medium">
                        {book.category}
                      </span>
                      <span className="text-sm text-gray-500">{book.year}</span>
                    </div>

                    <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-2 group-hover:text-brand-orange transition-colors">
                      {book.title}
                    </h3>

                    <p className="text-gray-600 mb-4 text-sm font-medium">
                      By {book.author}
                    </p>

                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {book.description}
                    </p>

                    <div className="flex items-center text-brand-teal font-medium group-hover:text-brand-orange transition-colors">
                      <span className="text-sm">Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 text-white" style={{ backgroundColor: '#042C45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-fredoka text-4xl font-bold mb-6">
              Join the Alkah Community
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Become part of our transformative book club where knowledge becomes 
              collective power and reading becomes resistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/matriarchive/alkah-library/book-club"
                className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <Calendar className="w-5 h-5" />
                <span>Join Book Club</span>
              </Link>
              <Link
                href="/matriarchive/alkah-library/suggestion"
                className="border-2 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF7D05';
                  e.currentTarget.style.borderColor = '#FF7D05';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }}
                style={{ borderColor: '#FF7D05' }}
              >
                <Plus className="w-5 h-5" />
                <span>Suggest Book</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
