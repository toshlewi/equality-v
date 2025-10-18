"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Calendar, ArrowLeft, ExternalLink } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  featured?: boolean;
  content?: string;
  author?: string;
  readTime?: string;
}

interface NewsModalProps {
  news: NewsItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsModal({ news, isOpen, onClose }: NewsModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Announcements':
        return 'bg-brand-orange text-white';
      case 'Updates':
        return 'bg-brand-yellow text-brand-teal';
      case 'Partnerships':
        return 'bg-brand-teal text-white';
      case 'Publications':
        return 'bg-brand-brown text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-3/4 h-full bg-white overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-brand-teal transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(news.category)}`}>
                      {news.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-brand-teal transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Featured Image */}
              <div className="relative h-80 rounded-lg overflow-hidden">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 75vw"
                  className="object-cover"
                />
                {news.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-brand-orange" />
                    <span>{formatDate(news.date)}</span>
                  </div>
                  {news.readTime && (
                    <span>{news.readTime} read</span>
                  )}
                </div>
                {news.author && (
                  <span>By {news.author}</span>
                )}
              </div>

              {/* Article Title */}
              <h1 className="font-fredoka text-3xl font-bold text-brand-teal leading-tight">
                {news.title}
              </h1>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {news.content || news.excerpt}
                </p>
                
                {/* Extended content placeholder */}
                <div className="space-y-4 text-gray-600">
                  <p>
                    This is a detailed article about {news.title.toLowerCase()}. 
                    In a real implementation, this would be fetched from the database 
                    and could include rich text formatting, images, and more content.
                  </p>
                  
                  <p>
                    The content would be stored in the MongoDB "news" collection 
                    with fields like content, author, tags, and more metadata 
                    for a complete news management system.
                  </p>
                  
                  <p>
                    This modal demonstrates the layout and structure for displaying 
                    full news articles with proper typography and spacing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex items-center text-brand-teal hover:text-brand-orange transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to News
                </button>
                
                <div className="flex items-center space-x-4">
                  <button className="text-gray-500 hover:text-brand-orange transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
