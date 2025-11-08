'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Eye, Download, Tag, Users, Wrench } from 'lucide-react';
import PDFViewer from '@/components/ui/PDFViewer';

interface Toolkit {
  _id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  targetAudience: string[];
  difficultyLevel: string;
  estimatedTime: string;
  coverImage: {
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

export default function ToolkitPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [toolkit, setToolkit] = useState<Toolkit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolkit = async () => {
      // Don't fetch if slug is undefined or empty
      if (!slug) {
        setError('Invalid toolkit ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch all toolkits and find the one with matching slug
        const response = await fetch('/api/toolkits');
        if (!response.ok) {
          throw new Error('Failed to fetch toolkits');
        }
        
        const data = await response.json();
        const foundToolkit = data.toolkits.find((toolkit: Toolkit) => 
          toolkit._id === slug || 
          toolkit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
        );
        
        if (!foundToolkit) {
          throw new Error('Toolkit not found');
        }
        
        setToolkit(foundToolkit);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchToolkit();
  }, [slug]);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  if (error || !toolkit) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-fredoka font-bold text-gray-900 mb-4">
              Toolkit Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The toolkit you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/matriarchive/toolkits-guides"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Toolkits & Guides</span>
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
              href="/matriarchive/toolkits-guides"
              className="inline-flex items-center space-x-2 text-brand-teal hover:text-brand-teal/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Toolkits & Guides</span>
            </Link>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{toolkit.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{toolkit.downloadCount}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-fredoka font-bold text-gray-900 mb-2">
                {toolkit.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{toolkit.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(toolkit.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{toolkit.estimatedTime}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-brand-yellow text-brand-teal text-sm font-medium rounded-full">
                  {toolkit.category}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(toolkit.difficultyLevel)}`}>
                  {toolkit.difficultyLevel}
                </span>
                {toolkit.featured && (
                  <span className="px-3 py-1 bg-brand-orange text-white text-sm font-medium rounded-full">
                    Featured
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {toolkit.description}
              </p>

              {/* Target Audience */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Target Audience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {toolkit.targetAudience.map((audience, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {toolkit.tags.map((tag, index) => (
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

      {/* Files Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-fredoka font-bold text-gray-900 mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Toolkit Files
          </h2>
          
          <div className="space-y-4">
            {toolkit.files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-brand-teal/10 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    <p className="text-sm text-gray-500">
                      {file.type.toUpperCase()} • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = file.url;
                    link.download = file.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Content - Show first PDF file if available */}
        {toolkit.files.length > 0 && toolkit.files[0].type === 'pdf' && (
          <PDFViewer
            pdfUrl={toolkit.files[0].url}
            title={toolkit.title}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
