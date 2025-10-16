"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Wrench, 
  Search, 
  Filter,
  Download,
  Eye,
  Star,
  ArrowRight,
  FileText,
  Users,
  Clock
} from "lucide-react";

interface Toolkit {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  description: string;
  targetAudience: string[];
  difficultyLevel: string;
  estimatedTime: string;
  coverImage?: {
    url: string;
    alt: string;
  };
  files: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  publishedAt: string;
  viewCount: number;
  downloadCount: number;
  featured: boolean;
  tags: string[];
}

export default function ToolkitsGuidesPage() {
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedAudience, setSelectedAudience] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["All", "Guide", "Toolkit", "Manual", "Framework", "Template", "Checklist"];
  const audiences = ["All", "Activists", "Researchers", "Students", "Organizations", "General Public"];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  // Fetch toolkits from API
  useEffect(() => {
    const fetchToolkits = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (selectedAudience !== "All") params.append("audience", selectedAudience);
        if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);
        params.append("sort", sortBy);
        
        const response = await fetch(`/api/toolkits?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch toolkits');
        }
        const data = await response.json();
        setToolkits(data.toolkits || []);
      } catch (error) {
        console.error("Error fetching toolkits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToolkits();
  }, [searchTerm, selectedCategory, selectedAudience, selectedDifficulty, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors = {
      Guide: "bg-blue-100 text-blue-800",
      Toolkit: "bg-green-100 text-green-800",
      Manual: "bg-purple-100 text-purple-800",
      Framework: "bg-orange-100 text-orange-800",
      Template: "bg-pink-100 text-pink-800",
      Checklist: "bg-yellow-100 text-yellow-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: "bg-green-100 text-green-800",
      Intermediate: "bg-yellow-100 text-yellow-800",
      Advanced: "bg-red-100 text-red-800"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
      <section className="bg-[#042C45] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-4">
              Toolkits & Guides
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Practical resources, frameworks, and guides to support your work in 
              gender justice and Pan-African feminism.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gray-50 border-b-2 border-[#FF7D05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search toolkits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-[#FF7D05]/30 rounded-lg focus:ring-2 focus:ring-[#FF7D05] focus:border-[#FF7D05]"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border-2 border-[#FF7D05]/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7D05] focus:border-[#FF7D05]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="border-2 border-[#FF7D05]/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7D05] focus:border-[#FF7D05]"
              >
                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="border-2 border-[#FF7D05]/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7D05] focus:border-[#FF7D05]"
              >
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-[#FF7D05]/30 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FF7D05] focus:border-[#FF7D05]"
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

      {/* Toolkits Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {toolkits.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No toolkits found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "All" || selectedAudience !== "All" || selectedDifficulty !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Our toolkit collection is growing. Check back soon for new resources!"
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toolkits.map((toolkit, index) => (
                <motion.div
                  key={toolkit._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/matriarchive/toolkits-guides/${toolkit._id}`}>
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-l-4 border-[#FF7D05] overflow-hidden">
                    {/* Cover Image */}
                    <div className="relative h-48 bg-gray-200">
                      {toolkit.coverImage ? (
                        <img
                          src={toolkit.coverImage.url}
                          alt={toolkit.coverImage.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wrench className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {toolkit.featured && (
                        <div className="absolute top-4 right-4 bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(toolkit.category)}`}>
                          {toolkit.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(toolkit.difficultyLevel)}`}>
                          {toolkit.difficultyLevel}
                        </span>
                      </div>

                      <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors line-clamp-2">
                        {toolkit.title}
                      </h3>

                      <p className="text-gray-600 mb-4 text-sm font-medium">
                        By {toolkit.author}
                      </p>

                      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        {toolkit.description}
                      </p>

                      {/* Target Audience */}
                      {toolkit.targetAudience && toolkit.targetAudience.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {toolkit.targetAudience.slice(0, 2).map((audience, audienceIndex) => (
                            <span
                              key={audienceIndex}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                              {audience}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{toolkit.viewCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{toolkit.downloadCount}</span>
                        </div>
                        {toolkit.estimatedTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{toolkit.estimatedTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Files Count */}
                      {toolkit.files && toolkit.files.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 mb-4">
                          <FileText className="w-4 h-4 mr-1" />
                          <span>{toolkit.files.length} file{toolkit.files.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      <div className="flex items-center text-brand-teal font-medium group-hover:text-brand-orange transition-colors">
                        <span className="text-sm">View Details</span>
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
