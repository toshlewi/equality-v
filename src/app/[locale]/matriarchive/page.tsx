"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FileText, 
  BookOpen, 
  Wrench, 
  ArrowRight,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function MatriArchiveHome() {
  const stats = [
    { label: "Publications", value: "20+", icon: <FileText className="w-6 h-6" /> },
    { label: "Books in Library", value: "30+", icon: <BookOpen className="w-6 h-6" /> },
    { label: "Toolkits & Guides", value: "5+", icon: <Wrench className="w-6 h-6" /> },
    { label: "Active Contributors", value: "10+", icon: <Users className="w-6 h-6" /> }
  ];

  const featuredContent = [
    {
      type: "Publication",
      title: "Digital Rights and Gender Justice in Africa",
      author: "Dr. Sarah Mwangi",
      date: "Dec 15, 2024",
      category: "Research",
      description: "An in-depth analysis of how digital rights intersect with gender justice across African contexts.",
      href: "/matriarchive/publications"
    },
    {
      type: "Book",
      title: "Purple Hibiscus",
      author: "Chimamanda Ngozi Adichie",
      date: "Dec 10, 2024",
      category: "Fiction",
      description: "Our latest book club discussion exploring themes of family, religion, and political awakening.",
      href: "/matriarchive/alkah-library"
    },
    {
      type: "Toolkit",
      title: "SRHR Advocacy Framework",
      author: "Equality Vanguard Team",
      date: "Dec 5, 2024",
      category: "Guide",
      description: "A comprehensive framework for advocating sexual and reproductive health and rights.",
      href: "/matriarchive/toolkits-guides"
    }
  ];

  return (
    <div className="min-h-screen">
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
              MatriArchive
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
              A comprehensive knowledge repository for gender justice, 
              Pan-African feminism, and transformative change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/matriarchive/publications"
                className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 hover:opacity-90"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <span>Explore Publications</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/matriarchive/alkah-library"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF7D05';
                  e.currentTarget.style.borderColor = '#FF7D05';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <span>Browse Library</span>
                <BookOpen className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-brand-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="font-fredoka text-3xl font-bold text-brand-teal mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Content */}
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
              Featured Content
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our latest publications, book discussions, and practical resources
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredContent.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Link href={item.href}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-l-4 border-brand-yellow">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-brand-teal text-white px-3 py-1 rounded-full text-sm font-medium">
                        {item.type}
                      </span>
                      <span className="text-sm text-gray-500">{item.date}</span>
                    </div>
                    
                    <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 text-sm">
                      By {item.author} • {item.category}
                    </p>
                    
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center text-brand-teal font-medium group-hover:text-brand-orange transition-colors">
                      <span className="text-sm">Read More</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
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
              Contribute to MatriArhive
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Share your knowledge, research, and insights to help build a comprehensive 
              resource for gender justice and Pan-African feminism.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/matriarchive/publications/submission"
                className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <FileText className="w-5 h-5" />
                <span>Submit Publication</span>
              </Link>
              <Link
                href="/matriarchive/alkah-library/suggestion"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF7D05';
                  e.currentTarget.style.borderColor = '#FF7D05';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <BookOpen className="w-5 h-5" />
                <span>Suggest Book</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
