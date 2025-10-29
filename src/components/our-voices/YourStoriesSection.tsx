"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Eye, Calendar, User, FileText, Image as ImageIcon, Volume2, Play, X } from "lucide-react";

interface Story {
  id: string;
  title: string;
  content: string;
  author: string;
  isAnonymous: boolean;
  publishedAt: string;
  media: {
    type: 'image' | 'video' | 'audio' | 'pdf';
    url: string;
    thumbnail?: string;
  }[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  featured: boolean;
}

export default function YourStoriesSection() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Placeholder data (preserved)
  useEffect(() => {
    const mockStories: Story[] = [
      {
        id: '1',
        title: 'My Journey to Self-Love',
        content: 'Growing up, I was constantly told that my worth was tied to my appearance and how others perceived me. It took years of unlearning these harmful beliefs to finally embrace who I truly am...',
        author: 'Anonymous',
        isAnonymous: true,
        publishedAt: '2024-12-15',
        media: [
          {
            type: 'image',
            url: '/images/hero-4.png',
            thumbnail: '/images/hero-4.png'
          }
        ],
        tags: ['Self-Love', 'Personal Growth', 'Mental Health'],
        likes: 45,
        comments: 12,
        shares: 8,
        views: 1560,
        featured: true
      },
      {
        id: '2',
        title: 'Overcoming Adversity in the Workplace',
        content: 'As a young woman in a male-dominated industry, I faced countless challenges. But I learned that my voice matters and my contributions are valuable...',
        author: 'Sarah M.',
        isAnonymous: false,
        publishedAt: '2024-12-12',
        media: [
          {
            type: 'video',
            url: '/videos/workplace-story.mp4',
            thumbnail: '/images/place1 (3).jpg'
          }
        ],
        tags: ['Workplace', 'Gender Equality', 'Empowerment'],
        likes: 32,
        comments: 7,
        shares: 15,
        views: 2100,
        featured: false
      },
      {
        id: '3',
        title: 'Finding My Voice Through Art',
        content: 'Art became my sanctuary when words failed me. Through painting and poetry, I discovered a way to express my deepest thoughts and feelings...',
        author: 'Anonymous',
        isAnonymous: true,
        publishedAt: '2024-12-10',
        media: [
          {
            type: 'image',
            url: '/images/place1 (8).jpg',
            thumbnail: '/images/place1 (8).jpg'
          },
          {
            type: 'audio',
            url: '/audio/art-story.mp3',
            thumbnail: '/images/place1 (8).jpg'
          }
        ],
        tags: ['Art', 'Expression', 'Healing'],
        likes: 28,
        comments: 5,
        shares: 12,
        views: 980,
        featured: false
      },
      {
        id: '4',
        title: 'Breaking Generational Patterns',
        content: 'I made a conscious decision to break the cycle of toxic patterns that had been passed down through generations in my family...',
        author: 'Maria K.',
        isAnonymous: false,
        publishedAt: '2024-12-08',
        media: [
          {
            type: 'pdf',
            url: '/documents/generational-patterns.pdf',
            thumbnail: '/images/place1 (9).jpg'
          }
        ],
        tags: ['Family', 'Healing', 'Breaking Cycles'],
        likes: 41,
        comments: 18,
        shares: 22,
        views: 1890,
        featured: true
      },
      {
        id: '5',
        title: 'Digital Rights and My Story',
        content: 'When my personal information was leaked online, I realized how important digital rights are for women and marginalized communities...',
        author: 'Anonymous',
        isAnonymous: true,
        publishedAt: '2024-12-05',
        media: [
          {
            type: 'video',
            url: '/videos/digital-rights-story.mp4',
            thumbnail: '/images/place1 (10).jpg'
          }
        ],
        tags: ['Digital Rights', 'Privacy', 'Online Safety'],
        likes: 36,
        comments: 9,
        shares: 14,
        views: 1200,
        featured: false
      },
      {
        id: '6',
        title: 'Community Support During Difficult Times',
        content: 'When I was going through a difficult period, the support from the Equality Vanguard community was invaluable...',
        author: 'Anonymous',
        isAnonymous: true,
        publishedAt: '2024-12-03',
        media: [
          {
            type: 'image',
            url: '/images/place1 (11).jpg',
            thumbnail: '/images/place1 (11).jpg'
          }
        ],
        tags: ['Community', 'Support', 'Solidarity'],
        likes: 52,
        comments: 23,
        shares: 19,
        views: 2300,
        featured: true
      }
    ];

    const load = async () => {
      try {
        const res = await fetch('/api/stories?status=published&limit=12');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && json.data?.stories?.length > 0) {
          const mapped: Story[] = json.data.stories.map((s: any) => ({
            id: s._id,
            title: s.title,
            content: s.content || s.text || '',
            author: s.anonymous ? 'Anonymous' : (s.submitterName || 'Anonymous'),
            isAnonymous: !!s.anonymous,
            publishedAt: s.publishedAt || s.createdAt,
            media: (s.mediaFiles || s.files || []).map((m: any) => ({
              type: m.mediaType || m.type || 'image',
              url: m.url,
              thumbnail: m.thumbnailUrl,
            })),
            tags: s.tags || [],
            likes: s.likeCount || 0,
            comments: 0,
            shares: s.shareCount || 0,
            views: s.viewCount || 0,
            featured: !!s.featured,
          }));
          setStories(mapped);
        } else {
          setStories(mockStories);
        }
      } catch {
    setStories(mockStories);
      } finally {
    setLoading(false);
      }
    };
    load();

    // Refresh on window focus to show latest updates
    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'audio':
        return <Volume2 className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 text-white" style={{ backgroundColor: '#042C45' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-white mb-4">
            Your Stories
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Read powerful stories shared by our community members. 
            Every story is a testament to resilience, strength, and the power of voice.
          </p>
        </motion.div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedStory(story)}
            >
              {/* Media Preview (use first image if any, otherwise default cover) */}
              <div className="relative aspect-video">
                {(() => {
                  const firstImage = story.media.find(m => m.type === 'image');
                  const coverSrc = firstImage?.thumbnail || firstImage?.url || '/images/story-cover.jpg';
                  return (
                <img
                      src={coverSrc}
                  alt={story.title}
                      className="w-full h-full object-cover object-center"
                />
                  );
                })()}
                
                {/* Media Type Indicator */}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  {story.media.map((media, idx) => (
                    <div
                      key={idx}
                      className="bg-black/60 text-white p-2 rounded-full"
                    >
                      {getMediaIcon(media.type)}
                    </div>
                  ))}
                </div>

                {/* Featured Badge */}
                {story.featured && (
                  <div className="absolute top-4 right-4 bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
              </div>

              {/* Story Content */}
              <div className="p-6">
                <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors line-clamp-2">
                  {story.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {story.content}
                </p>

                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{story.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(story.publishedAt)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{formatNumber(story.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{formatNumber(story.comments)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{formatNumber(story.shares)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(story.views)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Story Modal */}
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h3 className="font-fredoka text-2xl font-bold text-brand-teal">
                    {selectedStory.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedStory.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedStory.publishedAt)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedStory.content}
                </p>

                {/* Media Display with viewers */}
                {selectedStory.media.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-fredoka text-lg font-bold text-brand-teal mb-4">
                      Media
                    </h4>
                    <div className="space-y-4">
                      {selectedStory.media.map((media, idx) => {
                        if (media.type === 'image') {
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border">
                              <img src={media.url} alt={`Image ${idx + 1}`} className="w-full h-auto" />
                            </div>
                          );
                        }
                        if (media.type === 'video') {
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border">
                              <video src={media.url} controls className="w-full h-auto" />
                            </div>
                          );
                        }
                        if (media.type === 'audio') {
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border p-4">
                              <audio src={media.url} controls className="w-full" />
                            </div>
                          );
                        }
                        if (media.type === 'pdf') {
                          return (
                            <div key={idx} className="rounded-xl overflow-hidden border">
                              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                                <div className="flex items-center gap-2 text-gray-700">
                                  <FileText className="w-4 h-4" />
                                  <span>Document</span>
                                </div>
                                <a href={media.url} download className="text-sm text-brand-orange hover:underline">
                                  Download
                                </a>
                              </div>
                              <iframe src={`/api/view-pdf?path=${encodeURIComponent(media.url)}`} className="w-full h-[500px]" />
                            </div>
                          );
                        }
                        return (
                          <div key={idx} className="rounded-xl overflow-hidden border p-4">
                            <a href={media.url} target="_blank" rel="noreferrer" className="text-brand-orange hover:underline">Open media</a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedStory.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-yellow text-brand-teal px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{formatNumber(selectedStory.likes)} likes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{formatNumber(selectedStory.comments)} comments</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{formatNumber(selectedStory.shares)} shares</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(selectedStory.views)} views</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Have a story to share? Your voice matters and your story could inspire others.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-brand-yellow text-brand-teal px-8 py-4 rounded-lg font-semibold transition-colors hover:bg-brand-orange hover:text-white"
            onClick={() => {
              const element = document.querySelector('#tell-your-story');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Share Your Story
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
