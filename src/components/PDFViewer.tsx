"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  ExternalLink, 
  FileText, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  author?: string;
  description?: string;
  onClose?: () => void;
  showMetadata?: boolean;
}

export default function PDFViewer({ 
  pdfUrl, 
  title, 
  author, 
  description, 
  onClose,
  showMetadata = true 
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Handle PDF loading
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Reset zoom and rotation when PDF changes
    setZoom(100);
    setRotation(0);
    setCurrentPage(1);
  }, [pdfUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold truncate">{title}</CardTitle>
            {author && (
              <p className="text-sm text-gray-600">by {author}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 300}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Rotate Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {/* Open in New Tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>

            {/* Close Button */}
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* PDF Container */}
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* PDF Viewer */}
            <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
              {loading && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Failed to load PDF</p>
                    <p className="text-sm text-gray-500">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenInNewTab}
                      className="mt-4"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}&page=${currentPage}&rotate=${rotation}`}
                  className="w-full h-full border-0"
                  onLoad={() => setLoading(false)}
                  onError={() => {
                    setLoading(false);
                    setError('Failed to load PDF. The file may be corrupted or inaccessible.');
                  }}
                />
              )}
            </div>

            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* Metadata */}
        {showMetadata && description && (
          <div className="border-t p-4 bg-gray-50">
            <h4 className="font-medium text-sm text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

