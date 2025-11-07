"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import NewsModal from "./NewsModal";

interface NewsItem {
  id?: string; // legacy mock
  _id?: string; // API
  title: string;
  excerpt?: string;
  content?: string; // API - full article content
  date?: string; // legacy mock
  publishedAt?: string; // API
  image?: string; // legacy mock
  featuredImage?: string; // API
  category: string;
  featured?: boolean;
  author?: string | { name?: string }; // API - author can be string or object
}

interface NewsGridProps {
  news: NewsItem[];
}

export default function NewsGrid({ news }: NewsGridProps) {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
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

  const getKey = (item: NewsItem, index: number) => item.id || item._id || String(index);
  const getImage = (item: NewsItem) => item.image || item.featuredImage || '';
  const getDate = (item: NewsItem) => item.date || item.publishedAt || '';

  return (
    <section id="news" className="py-20 bg-brand-teal relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-white mb-6">
            News and Updates
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Stay informed about our latest initiatives, partnerships, and impact. 
            Follow our journey as we advance gender justice across Africa.
          </p>
        </motion.div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <motion.article
              key={getKey(item, index)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => handleNewsClick(item)}
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {getImage(item) ? (
                    <Image
                      src={getImage(item)!}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-brand-teal text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Featured badge */}
                  {item.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Read more overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-full p-3"
                    >
                      <ArrowRight className="w-6 h-6 text-brand-teal" />
                    </motion.div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-brand-teal text-sm mb-3">
                    <Calendar className="w-4 h-4 mr-2 text-brand-orange" />
                      <span>{getDate(item) ? formatDate(getDate(item)!) : '—'}</span>
                  </div>

                  <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 line-clamp-2 group-hover:text-brand-orange transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-brand-teal text-sm leading-relaxed line-clamp-3 mb-4">
                    {item.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewsClick(item);
                      }}
                      className="text-brand-orange font-semibold text-sm hover:text-brand-teal transition-colors flex items-center group"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNewsClick(item);
                      }}
                      className="text-brand-teal hover:text-brand-orange transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>


        {/* TODO: Connect to MongoDB "news" collection */}
        {/* API endpoints needed:
            - GET /api/news - fetch all news items
            - GET /api/news/[id] - fetch single news item
            - POST /api/news - create news item (admin)
            - PUT /api/news/[id] - update news item (admin)
            - DELETE /api/news/[id] - delete news item (admin)
        */}
      </div>

      {/* News Modal */}
      {selectedNews && (() => {
        const modalNews = {
          id: selectedNews._id || selectedNews.id || '',
          title: selectedNews.title,
          excerpt: selectedNews.excerpt || '',
          date: (selectedNews.publishedAt || selectedNews.date || ''),
          image: selectedNews.featuredImage || selectedNews.image || '',
          category: selectedNews.category,
          featured: !!selectedNews.featured,
          content: selectedNews.content || selectedNews.excerpt || '', // Use content if available, fallback to excerpt
          author: (typeof selectedNews.author === 'object'
            ? selectedNews.author?.name
            : selectedNews.author) || undefined,
          readTime: undefined,
        };
        return (
          <NewsModal
            news={modalNews as any}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        );
      })()}
    </section>
  );
}
