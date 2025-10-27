"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Filter,
  Calendar,
  User,
  Eye,
  Star,
  ArrowRight
} from "lucide-react";

interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  category: string;
  coverUrl?: string;
  description: string;
  shortDescription: string;
  featured: boolean;
  tags: string[];
}

export default function BookLibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMatriarchiveCategory, setSelectedMatriarchiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const categories = ["All", "Fiction", "Non-Fiction", "Biography", "Poetry", "Academic", "Children", "Other"];
  const genres = ["All", "Feminism", "African Literature", "Social Justice", "History", "Politics", "Memoir", "Poetry"];
  const matriarchiveCategories = ["All", "Covered", "Library"];

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const params = new URLSearchParams();
        params.append("status", "published"); // Only fetch published books
        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (selectedGenre !== "All") params.append("genre", selectedGenre);
        if (selectedMatriarchiveCategory !== "All") params.append("matriarchiveCategory", selectedMatriarchiveCategory);
        params.append("sort", sortBy);
        
        const response = await fetch(`/api/books?${params.toString()}`, {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data.data?.books || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchTerm, selectedCategory, selectedGenre, selectedMatriarchiveCategory, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors = {
      Fiction: "bg-blue-100 text-blue-800",
      "Non-Fiction": "bg-green-100 text-green-800",
      Biography: "bg-purple-100 text-purple-800",
      Poetry: "bg-pink-100 text-pink-800",
      Academic: "bg-orange-100 text-orange-800",
      Children: "bg-yellow-100 text-yellow-800",
      Other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
              Book Library
            </h1>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
              Explore our curated collection of feminist literature, academic texts, 
              and transformative works that shape our understanding of gender justice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-gray-50 border-b" style={{ borderColor: '#FF7D05' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
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

              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              <select
                value={selectedMatriarchiveCategory}
                onChange={(e) => setSelectedMatriarchiveCategory(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              >
                {matriarchiveCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                style={{ borderColor: '#FF7D05' }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="author">Author A-Z</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {books.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No books found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory !== "All" || selectedGenre !== "All"
                  ? "Try adjusting your search or filter criteria."
                  : "Our library is growing. Check back soon for new additions!"
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {books.map((book, index) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border-l-4 border-brand-yellow overflow-hidden">
                    {/* Book Cover */}
                    <div className="relative h-64 bg-gray-200">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {book.featured && (
                        <div className="absolute top-4 right-4 bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(book.category)}`}>
                          {book.category}
                        </span>
                        <span className="text-sm text-gray-500">{book.year}</span>
                      </div>

                      <h3 className="font-fredoka text-lg font-bold text-brand-teal mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-gray-600 mb-3 text-sm font-medium">
                        By {book.author}
                      </p>

                      <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                        {book.description || book.shortDescription}
                      </p>

                      {/* Genre */}
                      {book.genre && (
                        <div className="mb-4">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {book.genre}
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {book.tags && book.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {book.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
