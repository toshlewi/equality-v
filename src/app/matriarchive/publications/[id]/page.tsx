"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Publication {
  _id: string;
  title: string;
  slug: string;
  author: string;
  excerpt?: string;
  content?: string;
  pdfUrl?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  createdAt: string;
}

export default function PublicationReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublication();
  }, [params.id]);

  const fetchPublication = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/publications/${params.id}`, {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      const result = await response.json();

      if (result.success) {
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

  const getCategoryBadge = (category: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      blog: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Loading publication...</p>
        </div>
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Publication Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The publication you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/matriarchive/publications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Publications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.push('/matriarchive/publications')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Publications
            </Button>
            
            <div className="flex items-center gap-2">
              {publication.pdfUrl && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {publication.featuredImage && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
            <img
              src={publication.featuredImage}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Title and Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {getCategoryBadge(publication.category)}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {publication.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{publication.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(publication.publishedAt || publication.createdAt)}</span>
              </div>
            </div>

            {/* PDF Link */}
            {publication.pdfUrl && (
              <Card className="mb-8 border-brand-teal border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-brand-teal" />
                      <div>
                        <h3 className="font-semibold text-lg">View Full Document</h3>
                        <p className="text-sm text-gray-600">Download or view the complete PDF</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="bg-brand-teal hover:bg-brand-orange"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Excerpt */}
          {publication.excerpt && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-brand-teal">
              <p className="text-lg text-gray-700 italic leading-relaxed">
                {publication.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          {publication.content && (
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: publication.content }}
            />
          )}

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {publication.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </article>
    </div>
  );
}

