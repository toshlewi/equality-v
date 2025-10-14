"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  Share2,
  Download,
  FileText,
  Tag
} from "lucide-react";

interface Publication {
  _id: string;
  title: string;
  slug: string;
  author: string;
  authorEmail: string;
  category: string;
  description: string;
  content: string;
  coverImage?: {
    url: string;
    alt: string;
  };
  media: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  tags: string[];
  featured: boolean;
}

interface PublicationPageProps {
  params: {
    slug: string;
  };
}

export default function PublicationPage({ params }: PublicationPageProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      try {
        const response = await fetch(`/api/publications/${params.slug}`);
        if (!response.ok) {
          throw new Error("Publication not found");
        }
        const data = await response.json();
        setPublication(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load publication");
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [params.slug]);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Publication Not Found
          </h1>
          <p className="text-gray-500 mb-8">
            The publication you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/matriarchive/publications"
            className="inline-flex items-center space-x-2 bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Publications</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-teal to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href="/matriarchive/publications"
              className="inline-flex items-center space-x-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Publications</span>
            </Link>

            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(publication.category)}`}>
                {publication.category}
              </span>
              {publication.featured && (
                <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-6">
              {publication.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>{publication.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(publication.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>{publication.viewCount} views</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none"
          >
            {/* Cover Image */}
            {publication.coverImage && (
              <div className="mb-8">
                <img
                  src={publication.coverImage.url}
                  alt={publication.coverImage.alt}
                  className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
                />
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-4">
                About This Publication
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {publication.description}
              </p>
            </div>

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {publication.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {publication.content && (
              <div className="mb-8">
                <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-4">
                  Content
                </h2>
                <div 
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: publication.content }}
                />
              </div>
            )}

            {/* Media Files */}
            {publication.media && publication.media.length > 0 && (
              <div className="mb-8">
                <h2 className="font-fredoka text-2xl font-bold text-brand-teal mb-4">
                  Attachments
                </h2>
                <div className="space-y-3">
                  {publication.media.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.type} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={file.url}
                        download
                        className="flex items-center space-x-2 text-brand-teal hover:text-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Download</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{publication.likeCount} likes</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-brand-teal transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>
              <Link
                href="/matriarchive/publications"
                className="inline-flex items-center space-x-2 bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Publications</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
