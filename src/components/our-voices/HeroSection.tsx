"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Play, Volume2, FileText, Image as ImageIcon, X } from "lucide-react";
import { StaggeredGrid, FadeInSlide, FloatingElement } from "./ScrollAnimations";

interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'audio' | 'story';
  title: string;
  thumbnail: string;
  videoUrl?: string;
  duration?: number;
  author?: string;
  views?: number;
  featured?: boolean;
}

export default function HeroSection() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);

  // Placeholder data (preserved)
  useEffect(() => {
    const mockData: MediaItem[] = [
      {
        id: '1',
        type: 'video',
        title: 'Breaking the Silence: Women in Tech',
        thumbnail: '/images/hero-1.png',
        duration: 180,
        author: 'Sarah Mwangi',
        views: 1250,
        featured: true
      },
      {
        id: '2',
        type: 'image',
        title: 'Feminist Art Exhibition',
        thumbnail: '/images/hero-2.png',
        author: 'Anonymous',
        views: 890
      },
      {
        id: '3',
        type: 'audio',
        title: 'Podcast: Economic Justice',
        thumbnail: '/images/hero-3.png',
        duration: 2400,
        author: 'Dr. Amina Hassan',
        views: 2100
      },
      {
        id: '4',
        type: 'story',
        title: 'My Journey to Self-Love',
        thumbnail: '/images/hero-4.png',
        author: 'Anonymous',
        views: 1560
      },
      {
        id: '5',
        type: 'video',
        title: 'Digital Rights Workshop',
        thumbnail: '/images/hero-5.png',
        duration: 360,
        author: 'Tech Team',
        views: 980
      },
      {
        id: '6',
        type: 'image',
        title: 'Community Gathering',
        thumbnail: '/images/place1 (1).jpg',
        author: 'EV Community',
        views: 750
      },
      {
        id: '7',
        type: 'audio',
        title: 'Book Club Discussion',
        thumbnail: '/images/place1 (2).jpg',
        duration: 1800,
        author: 'ALKAH Book Club',
        views: 1200
      },
      {
        id: '8',
        type: 'story',
        title: 'Overcoming Adversity',
        thumbnail: '/images/place1 (3).jpg',
        author: 'Anonymous',
        views: 2100
      },
      {
        id: '9',
        type: 'video',
        title: 'Legal Rights Workshop',
        thumbnail: '/images/place1 (4).jpg',
        duration: 420,
        author: 'Legal Vanguard',
        views: 890
      },
      {
        id: '10',
        type: 'audio',
        title: 'Voices of Resistance',
        thumbnail: '/images/place1 (5).jpg',
        duration: 1800,
        author: 'Community Voices',
        views: 4200
      },
      {
        id: '11',
        type: 'image',
        title: 'Art for Change Exhibition',
        thumbnail: '/images/place1 (6).jpg',
        author: 'Creative Collective',
        views: 5800
      },
      {
        id: '12',
        type: 'story',
        title: 'From Struggle to Strength',
        thumbnail: '/images/place1 (7).jpg',
        author: 'Anonymous',
        views: 11200
      },
      {
        id: '13',
        type: 'video',
        title: 'Climate Justice Action',
        thumbnail: '/images/place1 (8).jpg',
        duration: 240,
        author: 'Environmental Team',
        views: 8900,
        featured: true
      }
    ];
    
    const load = async () => {
      try {
        const res = await fetch('/api/our-voices/hero');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const items: MediaItem[] = json.data
            .filter((i: any) => i.visible !== false && i.status !== 'draft')
            .slice(0, 13)
            .map((i: any) => ({
              id: i._id,
              type: i.type || 'image',
              title: i.title,
              thumbnail: i.thumbnail || i.backgroundImage,
              videoUrl: i.videoUrl,
              duration: i.duration,
              author: i.author,
              views: i.views,
              featured: i.featured,
            }));
          setMediaItems(items);
        } else {
          setMediaItems(mockData);
        }
      } catch {
    setMediaItems(mockData);
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'audio':
        return <Volume2 className="w-4 h-4" />;
      case 'story':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
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
    <section className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-fredoka text-5xl md:text-6xl font-bold text-brand-teal mb-6">
            Our Voices
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover powerful stories, videos, podcasts, and creative expressions 
            from our community. Every voice matters, every story counts.
          </p>
        </motion.div>

        {/* Diamond Collage Grid */}
        <div className="flex justify-center">
          <div className="grid grid-cols-5 gap-4 max-w-6xl">
            {/* Row 1 - Top single medium square */}
            <div className="col-start-3 col-span-1">
              <FloatingElement
                intensity={5}
                speed={3}
                className={`relative group ${mediaItems[0]?.type==='video' ? 'cursor-pointer' : ''} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square`}
              >
                {mediaItems[0] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[0].thumbnail}
                        alt={mediaItems[0].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[0].type === 'video' && (
                        <button
                          onClick={() => setSelectedVideo(mediaItems[0])}
                          className="absolute inset-0 flex items-center justify-center"
                          aria-label="Play video"
                        >
                          <div className="bg-brand-yellow text-brand-teal p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-2 md:p-3 rounded-full">
                              {getIcon(mediaItems[0].type)}
                            </div>
                            {mediaItems[0].duration && (
                              <span className="bg-black/60 text-white px-3 py-1 rounded text-sm font-medium">
                                {formatDuration(mediaItems[0].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[0].featured && (
                            <span className="bg-brand-orange text-white px-3 py-1 rounded text-sm font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-lg font-bold mb-2 line-clamp-2">
                            {mediaItems[0].title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-gray-200">
                            <span>{mediaItems[0].author}</span>
                            <span>{formatViews(mediaItems[0].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            {/* Row 2 - Three items: small, medium, small */}
            <div className="col-start-2 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.5}
                className={`relative group ${mediaItems[1]?.type==='video' ? 'cursor-pointer' : ''} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square`}
              >
                {mediaItems[1] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[1].thumbnail}
                        alt={mediaItems[1].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[1].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[1])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[1].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[1].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-3 col-span-1">
              <FloatingElement
                intensity={5}
                speed={3.2}
                className={`relative group ${mediaItems[2]?.type==='video' ? 'cursor-pointer' : ''} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square`}
              >
                {mediaItems[2] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[2].thumbnail}
                        alt={mediaItems[2].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[2].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[2])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-3 rounded-full">
                            <Play className="w-6 h-6" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-5 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-1.5 md:p-2.5 rounded-full">
                              {getIcon(mediaItems[2].type)}
                            </div>
                            {mediaItems[2].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(mediaItems[2].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[2].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-base font-bold mb-1 line-clamp-2">
                            {mediaItems[2].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-200">
                            <span>{mediaItems[2].author}</span>
                            <span>{formatViews(mediaItems[2].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-4 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.8}
                className={`relative group ${mediaItems[3]?.type==='video' ? 'cursor-pointer' : ''} rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square`}
              >
                {mediaItems[3] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[3].thumbnail}
                        alt={mediaItems[3].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[3].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[3])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[3].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[3].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            {/* Row 3 - Five items: small, medium, large, medium, small */}
            <div className="col-start-1 col-span-1">
              <FloatingElement
                intensity={3}
                speed={4}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[4] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[4].thumbnail}
                        alt={mediaItems[4].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[4].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[4])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[4].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[4].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-2 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.7}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[5] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[5].thumbnail}
                        alt={mediaItems[5].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[5].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[5])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-1.5 md:p-2 rounded-full">
                              {getIcon(mediaItems[5].type)}
                            </div>
                            {mediaItems[5].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(mediaItems[5].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[5].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-sm font-bold mb-1 line-clamp-2">
                            {mediaItems[5].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-200">
                            <span>{mediaItems[5].author}</span>
                            <span>{formatViews(mediaItems[5].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            {/* Large central rectangle */}
            <div className="col-start-3 col-span-1">
              <FloatingElement
                intensity={6}
                speed={2.8}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[6] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[6].thumbnail}
                        alt={mediaItems[6].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[6].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[6])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-3 rounded-full">
                            <Play className="w-6 h-6" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="bg-brand-yellow text-brand-teal p-2 sm:p-3 md:p-4 rounded-full">
                              {getIcon(mediaItems[6].type)}
                            </div>
                            {mediaItems[6].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium">
                                {formatDuration(mediaItems[6].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[6].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded text-xs sm:text-sm md:text-base font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-sm sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 line-clamp-2">
                            {mediaItems[6].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs sm:text-sm md:text-base text-gray-200">
                            <span className="truncate">{mediaItems[6].author}</span>
                            <span className="ml-2 flex-shrink-0">{formatViews(mediaItems[6].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-4 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.3}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[7] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[7].thumbnail}
                        alt={mediaItems[7].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[7].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[7])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-1.5 md:p-2 rounded-full">
                              {getIcon(mediaItems[7].type)}
                            </div>
                            {mediaItems[7].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(mediaItems[7].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[7].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-sm font-bold mb-1 line-clamp-2">
                            {mediaItems[7].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-200">
                            <span>{mediaItems[7].author}</span>
                            <span>{formatViews(mediaItems[7].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-5 col-span-1">
              <FloatingElement
                intensity={3}
                speed={4.2}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[8] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[8].thumbnail}
                        alt={mediaItems[8].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[8].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[8])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[8].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[8].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            {/* Row 4 - Three items: small, medium, small */}
            <div className="col-start-2 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.6}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[9] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[9].thumbnail}
                        alt={mediaItems[9].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[9].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[9])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[9].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[9].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-3 col-span-1">
              <FloatingElement
                intensity={5}
                speed={3.1}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[10] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[10].thumbnail}
                        alt={mediaItems[10].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[10].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[10])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-1.5 md:p-2 rounded-full">
                              {getIcon(mediaItems[10].type)}
                            </div>
                            {mediaItems[10].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(mediaItems[10].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[10].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-sm font-bold mb-1 line-clamp-2">
                            {mediaItems[10].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-200">
                            <span>{mediaItems[10].author}</span>
                            <span>{formatViews(mediaItems[10].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            <div className="col-start-4 col-span-1">
              <FloatingElement
                intensity={4}
                speed={3.9}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[11] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[11].thumbnail}
                        alt={mediaItems[11].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[11].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[11])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-3 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1">
                            <div className="bg-brand-yellow text-brand-teal p-0.5 sm:p-1 md:p-1.5 rounded-full">
                              {getIcon(mediaItems[11].type)}
                            </div>
                          </div>
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-xs font-bold mb-1 line-clamp-2">
                            {mediaItems[11].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>

            {/* Row 5 - Bottom single medium square */}
            <div className="col-start-3 col-span-1">
              <FloatingElement
                intensity={5}
                speed={3.4}
                className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square"
              >
                {mediaItems[12] && (
                  <>
                    <div className="relative aspect-square w-full">
                      <img
                        src={mediaItems[12].thumbnail}
                        alt={mediaItems[12].title}
                        className="w-full h-full object-cover"
                      />
                      {mediaItems[12].type === 'video' && (
                        <button onClick={() => setSelectedVideo(mediaItems[12])} className="absolute inset-0 flex items-center justify-center" aria-label="Play video">
                          <div className="bg-brand-yellow text-brand-teal p-2 rounded-full">
                            <Play className="w-5 h-5" />
                          </div>
                        </button>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="bg-brand-yellow text-brand-teal p-1 sm:p-1.5 md:p-2 rounded-full">
                              {getIcon(mediaItems[12].type)}
                            </div>
                            {mediaItems[12].duration && (
                              <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                                {formatDuration(mediaItems[12].duration)}
                              </span>
                            )}
                          </div>
                          {mediaItems[12].featured && (
                            <span className="bg-brand-orange text-white px-2 py-1 rounded text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="text-white">
                          <h3 className="font-fredoka text-sm font-bold mb-1 line-clamp-2">
                            {mediaItems[12].title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-200">
                            <span>{mediaItems[12].author}</span>
                            <span>{formatViews(mediaItems[12].views || 0)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </FloatingElement>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <FadeInSlide direction="up" delay={0.8} className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            Have a story to share? Join our community and make your voice heard.
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
        </FadeInSlide>
      </div>

      {/* Video Modal */}
      {selectedVideo && selectedVideo.videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-fredoka text-xl font-bold text-brand-teal">{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video controls className="w-full h-full" poster={selectedVideo.thumbnail}>
                <source src={selectedVideo.videoUrl} />
              </video>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
