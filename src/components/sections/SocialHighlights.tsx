'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image, { type ImageLoader } from 'next/image';

type HighlightPost = {
  id: string | number;
  caption: string;
  imageUrl: string;
  badge: 'post' | 'reel' | 'story';
  permalink?: string;
  mediaType?: string;
  username?: string;
  timestamp?: string;
  isLocal?: boolean;
};

const instagramFallbackPosts: HighlightPost[] = [
  { id: 1, imageUrl: '/images/place1 (9).jpg', caption: 'ALKAH Book Club session on "Purple Hibiscus"', badge: 'post', isLocal: true },
  { id: 2, imageUrl: '/images/place1 (10).jpg', caption: 'Behind the scenes: Legal Vanguard workshop', badge: 'reel', isLocal: true },
  { id: 3, imageUrl: '/images/place1 (11).jpg', caption: 'New addition to our feminist library', badge: 'post', isLocal: true },
  { id: 4, imageUrl: '/images/place1 (12).jpg', caption: 'Marching for women\'s rights in Nairobi', badge: 'reel', isLocal: true },
  { id: 5, imageUrl: '/images/place1 (13).jpg', caption: 'Podcast recording: Voices of Resistance', badge: 'post', isLocal: true },
  { id: 6, imageUrl: '/images/place1 (14).jpg', caption: 'Pan-African feminist solidarity', badge: 'story', isLocal: true },
  { id: 7, imageUrl: '/images/place1 (15).jpg', caption: 'Writing workshop: Telling our stories', badge: 'post', isLocal: true },
  { id: 8, imageUrl: '/images/place1 (16).jpg', caption: 'Art as resistance: Community mural project', badge: 'reel', isLocal: true },
  { id: 9, imageUrl: '/images/place1 (17).jpg', caption: 'Economic justice advocacy in action', badge: 'post', isLocal: true },
  { id: 10, imageUrl: '/images/place1 (18).jpg', caption: 'Digital rights awareness campaign', badge: 'reel', isLocal: true },
  { id: 11, imageUrl: '/images/place1 (19).jpg', caption: 'Sylvia Tamale book discussion highlights', badge: 'post', isLocal: true },
  { id: 12, imageUrl: '/images/place1 (20).jpg', caption: 'Celebrating our community achievements', badge: 'story', isLocal: true },
];

const directImageLoader: ImageLoader = ({ src }) => src;

const INSTAGRAM_ACCOUNT_URL = 'https://www.instagram.com/equalityvanguard/';

export default function SocialHighlights() {
  const [posts, setPosts] = useState<HighlightPost[]>(instagramFallbackPosts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const deriveBadge = (mediaType?: string): HighlightPost['badge'] => {
      if (mediaType === 'VIDEO') return 'reel';
      if (mediaType === 'STORY') return 'story';
      return 'post';
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await fetch('/api/instagram?limit=12', {
          next: { revalidate: 300 },
        });

        if (!response.ok) {
          throw new Error('Failed to load Instagram posts');
        }

        const payload = (await response.json()) as {
          data?: Array<{
            id: string;
            caption: string;
            mediaUrl: string;
            permalink: string;
            mediaType?: string;
            timestamp?: string;
            username?: string;
          }>;
        };

        if (isCancelled) {
          return;
        }

        if (payload.data && payload.data.length > 0) {
          const remotePosts: HighlightPost[] = payload.data
            .map((item) => {
              const badge = deriveBadge(item.mediaType);
              const imageUrl = item.mediaUrl;

              if (!imageUrl) {
                return null;
              }

              return {
                id: String(item.id),
                caption: item.caption ?? '',
                imageUrl,
                badge,
                permalink: item.permalink,
                mediaType: item.mediaType,
                timestamp: item.timestamp,
                username: item.username,
                isLocal: false,
              } as HighlightPost;
            })
            .filter((post): post is HighlightPost => post !== null);

          if (remotePosts.length > 0) {
            setPosts(remotePosts);
            setCurrentIndex(0);
            setError(null);
            return;
          }
        }

        setError('No Instagram posts available right now.');
      } catch (err) {
        if (!isCancelled) {
          setError('Unable to load Instagram posts right now.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchInstagramPosts();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (posts.length === 0) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => {
      if (prev >= posts.length) {
        return 0;
      }
      return prev;
    });
  }, [posts.length]);

  useEffect(() => {
    if (isPaused || posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [posts.length, isPaused]);

  const nextSlide = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevSlide = () => {
    if (posts.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const activePostCount = posts.length;
  const trackWidth = activePostCount * 336;

  return (
    <section className="py-20 bg-gradient-to-br from-brand-teal to-brand-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-yellow mb-4">
            Social Highlights
          </h2>
          <p className="font-spartan text-lg text-white/90 max-w-2xl mx-auto">
            Follow our journey on social media and join the conversation
          </p>
        </motion.div>

        {/* Instagram Carousel */}
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ height: '400px' }}
        >
          <motion.div
            className="flex space-x-4"
            animate={{ x: -currentIndex * 336 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ width: `${trackWidth}px` }}
          >
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 h-80 relative group cursor-pointer"
              >
                {/* Media placeholder */}
                <div className="aspect-square rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 relative bg-gradient-to-br from-white to-[#042c45]/20">
                  <Image
                    src={post.imageUrl}
                    alt={`${post.badge} - ${post.caption}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    loader={post.isLocal ? undefined : directImageLoader}
                    unoptimized={!post.isLocal}
                    priority={index < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="text-sm font-semibold">
                        {post.badge === 'reel' ? 'VIDEO' : post.badge === 'story' ? 'STORY' : 'PHOTO'}
                      </div>
                      {post.badge === 'reel' && (
                        <div className="absolute bottom-3 right-3 text-xs text-white font-bold bg-black/30 px-2 py-1 rounded">0:45</div>
                      )}
                      {post.badge === 'story' && (
                        <div className="absolute top-3 left-3 w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-brand-teal">EV</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Hover overlay with social icons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-6">
                      <a
                        href={post.permalink ?? INSTAGRAM_ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <span className="text-2xl">❤️</span>
                      </a>
                      <a
                        href={post.permalink ?? INSTAGRAM_ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <span className="text-2xl">💬</span>
                      </a>
                      <a
                        href={post.permalink ?? INSTAGRAM_ACCOUNT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <span className="text-2xl">📤</span>
                      </a>
                    </div>
                  </div>
                  
                  {/* Post type indicator */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      post.badge === 'reel' ? 'bg-brand-orange text-white' :
                      post.badge === 'story' ? 'bg-brand-yellow text-brand-teal' :
                      'bg-white/40 text-white'
                    }`}>
                      {post.badge === 'reel' ? '🎥' : post.badge === 'story' ? '📱' : '📸'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all duration-300"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.min(10, Math.max(activePostCount, 1)) }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === i 
                  ? 'bg-brand-yellow scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Post counter */}
        <div className="text-center mt-4">
          <span className="text-sm text-white/70">
            {activePostCount === 0 ? 'No posts available' : `${Math.min(currentIndex + 1, activePostCount)} of ${activePostCount} posts`}
          </span>
        </div>

        {isLoading && (
          <div className="text-center mt-4">
            <span className="text-sm text-white/70">Loading latest posts…</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center mt-4">
            <span className="text-sm text-brand-yellow/90">{error}</span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href={INSTAGRAM_ACCOUNT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-lg px-8 py-4 hover:bg-brand-yellow hover:text-brand-teal transition-all duration-300 transform hover:scale-105"
          >
            Follow us on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
