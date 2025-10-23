'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Eye, Download, Tag } from 'lucide-react';
import PDFViewer from '@/components/ui/PDFViewer';

interface Publication {
  _id: string;
  title: string;
  author: string;
  coverImage: {
    url: string;
    alt: string;
  };
  description: string;
  category: string;
  publishedAt: string;
  tags: string[];
  pdfUrl: string;
  featured: boolean;
  readTime: string;
  viewCount: number;
  downloadCount: number;
}

export default function PublicationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublication = async () => {
      // Don't fetch if slug is undefined or empty
      if (!slug) {
        setError('Invalid publication ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch all publications and find the one with matching slug
        const response = await fetch('/api/publications');
        if (!response.ok) {
          throw new Error('Failed to fetch publications');
        }
        
        const data = await response.json();
        const foundPublication = data.publications.find((pub: Publication) => 
          pub._id === slug || 
          pub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
        );
        
        if (!foundPublication) {
          throw new Error('Publication not found');
        }
        
        setPublication(foundPublication);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-fredoka font-bold text-gray-900 mb-4">
              Publication Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The publication you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/matriarchive/publications"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Publications</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/matriarchive/publications"
              className="inline-flex items-center space-x-2 text-brand-teal hover:text-brand-teal/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Publications</span>
            </Link>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{publication.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{publication.downloadCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-fredoka font-bold text-gray-900 mb-2">
                {publication.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{publication.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(publication.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{publication.readTime}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-brand-yellow text-brand-teal text-sm font-medium rounded-full">
                  {publication.category}
                </span>
                {publication.featured && (
                  <span className="px-3 py-1 bg-brand-orange text-white text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {publication.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PDFViewer
          pdfUrl={publication.pdfUrl}
          title={publication.title}
          className="w-full"
        />
      </div>
    </div>
  );
}