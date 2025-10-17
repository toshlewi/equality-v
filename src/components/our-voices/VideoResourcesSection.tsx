"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Play, Clock, Eye, User, X } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  author: string;
  views: number;
  publishedAt: string;
  tags: string[];
}

export default function VideoResourcesSection() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Mock data - will be replaced with API call
  const videos: Video[] = [
    {
      id: '1',
      title: 'Breaking the Silence: Women in Tech',
      description: 'An inspiring conversation about the challenges and triumphs of women in the technology sector across Africa.',
      thumbnail: '/images/hero-1.png',
      videoUrl: '/videos/breaking-silence.mp4',
      duration: 180,
      author: 'Sarah Mwangi',
      views: 1250,
      publishedAt: '2024-12-15',
      tags: ['Technology', 'Women Empowerment', 'Career']
    },
    {
      id: '2',
      title: 'Digital Rights Workshop',
      description: 'Learn about digital rights, privacy, and online safety in this comprehensive workshop.',
      thumbnail: '/images/hero-5.png',
      videoUrl: '/videos/digital-rights.mp4',
      duration: 360,
      author: 'Tech Team',
      views: 980,
      publishedAt: '2024-12-10',
      tags: ['Digital Rights', 'Privacy', 'Workshop']
    },
    {
      id: '3',
      title: 'Legal Rights Workshop',
      description: 'Understanding your legal rights and how to access justice in various situations.',
      thumbnail: '/images/place1 (4).jpg',
      videoUrl: '/videos/legal-rights.mp4',
      duration: 420,
      author: 'Legal Vanguard',
      views: 890,
      publishedAt: '2024-12-08',
      tags: ['Legal Rights', 'Justice', 'Education']
    },
    {
      id: '4',
      title: 'Economic Justice Panel',
      description: 'A deep dive into economic justice, fair wages, and women\'s economic empowerment.',
      thumbnail: '/images/place1 (5).jpg',
      videoUrl: '/videos/economic-justice.mp4',
      duration: 540,
      author: 'Dr. Amina Hassan',
      views: 2100,
      publishedAt: '2024-12-05',
      tags: ['Economic Justice', 'Empowerment', 'Panel Discussion']
    }
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
            Video Resources
          </h2>
          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Watch our educational videos, workshops, and inspiring stories 
            from the Equality Vanguard community.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedVideo(video)}
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors duration-300">
                  <div className="bg-brand-yellow text-brand-teal p-4 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute top-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(video.duration)}</span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 group-hover:text-brand-orange transition-colors">
                  {video.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {video.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{video.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)} views</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {video.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
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
                <h3 className="font-fredoka text-2xl font-bold text-brand-teal">
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black">
                <video
                  controls
                  className="w-full h-full"
                  poster={selectedVideo.thumbnail}
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Details */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedVideo.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(selectedVideo.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(selectedVideo.views)} views</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(selectedVideo.publishedAt)}
                  </span>
                </div>

                <p className="text-gray-700 mb-4">
                  {selectedVideo.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedVideo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-brand-yellow text-brand-teal px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
