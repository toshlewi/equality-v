import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Publication from '@/models/Publication';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Download, Share2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ publicationId: string }>;
}

async function getPublication(publicationId: string) {
  await connectDB();
  
  // Try to find by ID or slug
  const publication = await Publication.findOne({
    $or: [
      { _id: publicationId },
      { slug: publicationId }
    ],
    status: 'published'
  }).lean();

  return publication;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicationId } = await params;
  const publication = await getPublication(publicationId);

  if (!publication) {
    return {
      title: 'Publication Not Found',
    };
  }

  return {
    title: publication.seoTitle || publication.title,
    description: publication.seoDescription || publication.excerpt,
    openGraph: {
      title: publication.seoTitle || publication.title,
      description: publication.seoDescription || publication.excerpt,
      images: publication.featuredImage ? [publication.featuredImage] : [],
      type: 'article',
      publishedTime: publication.publishedAt?.toISOString(),
    },
  };
}

export default async function PublicationReaderPage({ params }: PageProps) {
  const { publicationId } = await params;
  const publication = await getPublication(publicationId);

  if (!publication) {
    notFound();
  }

  const publishedDate = publication.publishedAt 
    ? new Date(publication.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Calculate reading time
  const wordsPerMinute = 200;
  const wordCount = publication.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/matriarchive/publications"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Publications</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {publication.pdfUrl && (
                <a
                  href={publication.pdfUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: publication.title,
                      text: publication.excerpt || '',
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Featured Image */}
          {publication.featuredImage && (
            <div className="w-full h-64 md:h-96 relative">
              <img
                src={publication.featuredImage}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-10">
            {/* Category Badge */}
            {publication.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full uppercase">
                  {publication.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {publication.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
              {publication.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>By {publication.author}</span>
                </div>
              )}
              {publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{publishedDate}</span>
                </div>
              )}
              {readingTime > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
              )}
            </div>

            {/* Excerpt */}
            {publication.excerpt && (
              <div className="mb-8 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  {publication.excerpt}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: publication.content }}
            />

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {publication.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* PDF Viewer (if PDF URL exists) */}
        {publication.pdfUrl && publication.type === 'pdf' && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Original PDF Document</h2>
              <p className="text-sm text-gray-600 mt-1">
                View the original PDF or download it using the button above.
              </p>
            </div>
            <div className="relative w-full" style={{ height: '800px' }}>
              <iframe
                src={`${publication.pdfUrl}#view=FitH`}
                className="w-full h-full border-0"
                title={`PDF: ${publication.title}`}
              />
            </div>
          </div>
        )}

        {/* Back to Publications */}
        <div className="mt-8 text-center">
          <Link
            href="/matriarchive/publications"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Publications
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Equality Vanguard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
