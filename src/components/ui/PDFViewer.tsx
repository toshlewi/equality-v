'use client';

import { useState, useEffect } from 'react';
import { Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { extractPDFText, formatPDFContent } from '@/lib/pdf-utils';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  className?: string;
}

export default function PDFViewer({ pdfUrl, title, className = '' }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string>('');

  useEffect(() => {
    const fetchPDFContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const pdfData = await extractPDFText(pdfUrl);
        const formattedContent = formatPDFContent(pdfData.text);
        setPdfContent(formattedContent);
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load PDF content');
        setIsLoading(false);
      }
    };

    if (pdfUrl) {
      fetchPDFContent();
    }
  }, [pdfUrl, title]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brand-teal" />
          <p className="text-gray-600">Loading PDF content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header with title and download button */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-brand-teal" />
            <h2 className="text-xl font-fredoka font-bold text-gray-900">{title}</h2>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-6">
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: pdfContent
                .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 text-gray-900">$1</h2>')
                .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium mb-2 text-gray-900">$1</h3>')
                .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')
                .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                .replace(/\n\n/g, '</p><p class="mb-4">')
                .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
                .replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 mb-4">$1</ul>')
                .replace(/<p class="mb-4"><\/p>/g, '')
            }}
          />
        </div>
      </div>

      {/* Footer with additional download options */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>Need to save this for later? Download the full PDF above.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="text-sm text-brand-teal hover:text-brand-teal/80 font-medium"
            >
              Download PDF
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => window.print()}
              className="text-sm text-brand-teal hover:text-brand-teal/80 font-medium"
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
