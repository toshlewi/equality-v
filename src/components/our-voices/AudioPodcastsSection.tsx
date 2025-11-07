"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Play, Pause, Volume2, Clock, User, Download, Share2 } from "lucide-react";

interface AudioItem {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  thumbnail: string;
  duration: number;
  author: string;
  publishedAt: string;
  category: string;
  episode?: number;
  season?: number;
}

export default function AudioPodcastsSection() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Placeholders (preserved)
  const placeholders: AudioItem[] = [
    {
      id: '1',
      title: 'Economic Justice in Africa',
      description: 'A deep dive into economic justice, fair wages, and women\'s economic empowerment across the continent.',
      audioUrl: '/audio/economic-justice.mp3',
      thumbnail: '/images/hero-3.png',
      duration: 2400,
      author: 'Dr. Amina Hassan',
      publishedAt: '2024-12-15',
      category: 'Podcast',
      episode: 1,
      season: 1
    },
    {
      id: '2',
      title: 'ALKAH Book Club Discussion',
      description: 'Our monthly book club discussion featuring "Purple Hibiscus" by Chimamanda Ngozi Adichie.',
      audioUrl: '/audio/book-club-discussion.mp3',
      thumbnail: '/images/place1 (2).jpg',
      duration: 1800,
      author: 'ALKAH Book Club',
      publishedAt: '2024-12-10',
      category: 'Book Club'
    },
    {
      id: '3',
      title: 'Digital Rights and Privacy',
      description: 'Exploring digital rights, online privacy, and how to protect yourself in the digital age.',
      audioUrl: '/audio/digital-rights.mp3',
      thumbnail: '/images/place1 (6).jpg',
      duration: 2100,
      author: 'Tech Team',
      publishedAt: '2024-12-08',
      category: 'Educational'
    },
    {
      id: '4',
      title: 'SRHR Advocacy Stories',
      description: 'Personal stories and experiences from advocates working in sexual and reproductive health and rights.',
      audioUrl: '/audio/srhr-stories.mp3',
      thumbnail: '/images/place1 (7).jpg',
      duration: 2700,
      author: 'SRHR Team',
      publishedAt: '2024-12-05',
      category: 'Stories'
    },
    {
      id: '5',
      title: 'Legal Vanguard Insights',
      description: 'Legal experts discuss current issues in gender justice and human rights law.',
      audioUrl: '/audio/legal-insights.mp3',
      thumbnail: '/images/place1 (8).jpg',
      duration: 1950,
      author: 'Legal Vanguard',
      publishedAt: '2024-12-03',
      category: 'Legal'
    },
    {
      id: '6',
      title: 'Community Voices',
      description: 'A collection of voices from our community sharing their experiences and insights.',
      audioUrl: '/audio/community-voices.mp3',
      thumbnail: '/images/place1 (9).jpg',
      duration: 2250,
      author: 'Community',
      publishedAt: '2024-12-01',
      category: 'Community'
    }
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/our-voices/audio');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: AudioItem[] = json.data
            .filter((a: any) => a.visible !== false && a.status !== 'draft')
            .map((a: any) => ({
              id: a._id,
              title: a.title,
              description: a.description || '',
              audioUrl: a.audioUrl,
              thumbnail: a.thumbnail || '/images/hero-3.png',
              duration: a.duration || 0,
              author: a.author || 'Community',
              publishedAt: a.publishedAt || new Date().toISOString(),
              category: a.category || 'Podcast',
              episode: a.episode,
              season: a.season,
            }));
          setAudioItems(mapped);
        } else {
          setAudioItems(placeholders);
        }
      } catch {
        setAudioItems(placeholders);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePlayPause = (item: AudioItem) => {
    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = item.audioUrl;
        audioRef.current.play();
      }
      setPlayingId(item.id);
      setDuration(item.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setPlayingId(null);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Audio & Podcasts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Listen to our podcasts, discussions, and audio content 
            featuring voices from across the Equality Vanguard community.
          </p>
        </motion.div>

        {/* Audio List */}
        <div className="space-y-6">
          {audioItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start space-x-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.duration)}</span>
                        </div>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-brand-yellow text-brand-teal px-3 py-1 rounded-full text-sm font-medium">
                        {item.category}
                      </span>
                      {item.episode && (
                        <span className="text-sm text-gray-500">
                          S{item.season}E{item.episode}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Audio Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handlePlayPause(item)}
                      className="bg-brand-yellow text-brand-teal p-3 rounded-full hover:bg-brand-orange hover:text-white transition-colors duration-300"
                    >
                      {playingId === item.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={item.duration}
                        value={playingId === item.id ? currentTime : 0}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #FFD935 0%, #FFD935 ${playingId === item.id ? (currentTime / item.duration) * 100 : 0}%, #E5E7EB ${playingId === item.id ? (currentTime / item.duration) * 100 : 0}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatTime(playingId === item.id ? currentTime : 0)}</span>
                        <span>{formatTime(item.duration)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Share2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Audio Element */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          preload="metadata"
        />

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Have an audio story or podcast episode to share? We'd love to hear from you.
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
            Submit Audio Content
          </motion.button>
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #FFD935;
          cursor: pointer;
          border: 2px solid #042C45;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #FFD935;
          cursor: pointer;
          border: 2px solid #042C45;
        }
      `}</style>
    </section>
  );
}
