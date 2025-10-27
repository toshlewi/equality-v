"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Publication {
  _id: string;
  title: string;
  author: string;
  content: string;
  pdfUrl?: string;
  images?: string[];
  type: string;
  publishedAt: string;
  category: string;
  tags: string[];
}

export default function PublicationReadingPage() {
  const params = useParams();
  const router = useRouter();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublication();
  }, [params.slug]);

  const fetchPublication = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/publications/slug/${params.slug}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setPublication(result.data);
      } else {
        setError('Publication not found');
      }
    } catch (err) {
      console.error('Error fetching publication:', err);
      setError('Failed to load publication');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (publication?.pdfUrl) {
      const link = document.createElement('a');
      link.href = publication.pdfUrl;
      link.download = `${publication.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading publication...</p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Publication Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The publication you are looking for does not exist.'}</p>
          <Link href="/matriarchive" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to MatriArchive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 line-clamp-1">{publication.title}</h1>
                <p className="text-sm text-gray-600">by {publication.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {publication.pdfUrl && (
                <>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <a
                    href={publication.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open PDF
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {/* Publication Header */}
          <div className="border-b border-gray-200 px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{publication.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="font-medium">by {publication.author}</span>
              {publication.publishedAt && (
                <>
                  <span>•</span>
                  <span>{formatDate(publication.publishedAt)}</span>
                </>
              )}
            </div>
            
            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {publication.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Content */}
          <article 
            className="prose prose-lg max-w-none px-8 py-8"
            dangerouslySetInnerHTML={{ __html: publication.content }}
            style={{
              maxWidth: '750px',
              margin: '0 auto'
            }}
          />

          {/* Publication Footer */}
          <div className="border-t border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Category: <span className="font-medium capitalize">{publication.category}</span>
              </p>
              {publication.pdfUrl && (
                <button
                  onClick={handleDownload}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Download as PDF
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Back Navigation */}
        <div className="mt-8">
          <Link
            href="/matriarchive"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all publications
          </Link>
        </div>
      </div>
    </div>
  );
}
