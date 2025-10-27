"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Document {
  _id: string;
  title: string;
  author: string;
  description?: string;
  content?: string;
  pdfUrl?: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  publishedAt: string;
  viewCount: number;
  type: 'publication' | 'toolkit' | 'book';
}

export default function DocumentReaderPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPDF, setShowPDF] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from different endpoints based on the document type
      const endpoints = [
        `/api/publications/${params.id}`,
        `/api/toolkits/${params.id}`,
        `/api/books/${params.id}`
      ];

      let documentData = null;
      let documentType = '';

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          const result = await response.json();
          
          if (result.success) {
            documentData = result.data;
            if (endpoint.includes('publications')) {
              documentType = 'publication';
            } else if (endpoint.includes('toolkits')) {
              documentType = 'toolkit';
            } else if (endpoint.includes('books')) {
              documentType = 'book';
            }
            break;
          }
        } catch (err) {
          // Continue to next endpoint
          continue;
        }
      }

      if (documentData) {
        setDocument({
          ...documentData,
          type: documentType as 'publication' | 'toolkit' | 'book'
        });
      } else {
        setError('Document not found');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document?.pdfUrl) {
      const link = document.createElement('a');
      link.href = document.pdfUrl;
      link.download = `${document.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (document?.pdfUrl) {
      window.open(document.pdfUrl, '_blank');
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      blog: 'bg-green-100 text-green-800',
      report: 'bg-purple-100 text-purple-800',
      legal: 'bg-red-100 text-red-800',
      advocacy: 'bg-orange-100 text-orange-800',
      education: 'bg-yellow-100 text-yellow-800',
      community: 'bg-pink-100 text-pink-800',
      research: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The document you are looking for does not exist.'}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{document.title}</h1>
                <p className="text-sm text-gray-600">by {document.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {document.pdfUrl && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowPDF(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOpenInNewTab}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Document Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold">{document.title}</CardTitle>
                      <p className="text-gray-600 mt-2">by {document.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(document.category)}
                      <Badge variant="outline">
                        {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {document.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{document.description}</p>
                    </div>
                  )}

                  {/* PDF Preview */}
                  {document.pdfUrl && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-4">Document Preview</h3>
                      <div className="border rounded-lg overflow-hidden bg-gray-100">
                        <iframe
                          src={`${document.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=75`}
                          className="w-full h-96 border-0"
                          title={document.title}
                        />
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  {document.content && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-4">Content</h3>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: document.content }}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Details */}
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Published</h4>
                  <p className="text-sm text-gray-600">{formatDate(document.publishedAt)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Views</h4>
                  <p className="text-sm text-gray-600">{document.viewCount.toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Category</h4>
                  <p className="text-sm text-gray-600 capitalize">{document.category}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-1">Type</h4>
                  <p className="text-sm text-gray-600 capitalize">{document.type}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {document.pdfUrl && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setShowPDF(true)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Full PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {showPDF && document.pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{document.title}</h3>
              <Button
                variant="outline"
                onClick={() => setShowPDF(false)}
              >
                Close
              </Button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`${document.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={document.title}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

