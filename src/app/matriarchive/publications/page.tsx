"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FileText, 
  Calendar, 
  User, 
  Search, 
  Filter,
  Plus,
  ArrowRight,
  Eye,
  Heart,
  Share2
} from "lucide-react";

interface Publication {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  description: string;
  coverImage?: {
    url: string;
    alt: string;
  };
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
  featured: boolean;
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["All", "Article", "Blog", "Report", "Research", "Opinion"];

  // Fetch publications from API
  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const params = new URLSearchParams();
        params.append("status", "published"); // Only fetch published publications
        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        params.append("sort", sortBy);
        
        const response = await fetch(`/api/publications?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch publications');
        }
        const data = await response.json();
        setPublications(data.data.publications || []);
      } catch (error) {
        console.error("Error fetching publications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, [searchTerm, selectedCategory, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors = {
      Article: "bg-blue-100 text-blue-800",
      Blog: "bg-green-100 text-green-800",
      Report: "bg-purple-100 text-purple-800",
      Research: "bg-orange-100 text-orange-800",
      Opinion: "bg-pink-100 text-pink-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="text-white py-16" style={{ backgroundColor: '#042C45' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
              Publications
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explore our collection of articles, blogs, reports, and research 
              on gender justice and Pan-African feminism.
            </p>
            <Link
              href="/matriarchive/publications/submission"
              className="inline-flex items-center space-x-2 bg-brand-yellow text-brand-teal px-6 py-3 rounded-lg font-semibold transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
            >
              <Plus className="w-5 h-5" />
              <span>Submit Publication</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gray-50 border-b" style={{ borderColor: '#FF7D05' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Publications Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {publications.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No publications found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "All" 
                  ? "Try adjusting your search or filter criteria."
                  : "Be the first to submit a publication!"
                }
              </p>
              <Link
                href="/matriarchive/publications/submission"
                className="inline-flex items-center space-x-2 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#042C45' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF7D05'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#042C45'}
              >
                <Plus className="w-5 h-5" />
                <span>Submit Publication</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((publication, index) => (
                <motion.div
                  key={publication._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/matriarchive/publications/${publication._id}`}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-l-4 border-brand-yellow overflow-hidden">
                      {/* Cover Image */}
                      <div className="relative h-48 bg-gray-200">
                        {publication.coverImage ? (
                          <img
                            src={publication.coverImage.url}
                            alt={publication.coverImage.alt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        {publication.featured && (
                          <div className="absolute top-4 left-4 bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(publication.category)}`}>
                            {publication.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(publication.publishedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors line-clamp-2">
                          {publication.title}
                        </h3>

                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                          {publication.description}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{publication.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{publication.viewCount}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        {publication.tags && publication.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {publication.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="flex items-center text-brand-teal font-medium group-hover:text-brand-orange transition-colors">
                        <span className="text-sm">Read More</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
