'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SocialHighlights() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const instagramPosts = [
    { id: 1, image: '📸', caption: 'ALKAH Book Club session on "Purple Hibiscus"', likes: 42, type: 'post' },
    { id: 2, image: '🎥', caption: 'Behind the scenes: Legal Vanguard workshop', likes: 38, type: 'reel' },
    { id: 3, image: '📚', caption: 'New addition to our feminist library', likes: 29, type: 'post' },
    { id: 4, image: '✊', caption: 'Marching for women\'s rights in Nairobi', likes: 156, type: 'reel' },
    { id: 5, image: '🎤', caption: 'Podcast recording: Voices of Resistance', likes: 67, type: 'post' },
    { id: 6, image: '🌍', caption: 'Pan-African feminist solidarity', likes: 89, type: 'story' },
    { id: 7, image: '📝', caption: 'Writing workshop: Telling our stories', likes: 34, type: 'post' },
    { id: 8, image: '🎨', caption: 'Art as resistance: Community mural project', likes: 78, type: 'reel' },
    { id: 9, image: '💪', caption: 'Economic justice advocacy in action', likes: 45, type: 'post' },
    { id: 10, image: '🔊', caption: 'Digital rights awareness campaign', likes: 92, type: 'reel' },
    { id: 11, image: '📖', caption: 'Sylvia Tamale book discussion highlights', likes: 51, type: 'post' },
    { id: 12, image: '🌟', caption: 'Celebrating our community achievements', likes: 103, type: 'story' },
    { id: 13, image: '🎭', caption: 'Theater performance: "Breaking the Silence"', likes: 87, type: 'reel' },
    { id: 14, image: '📊', caption: 'Research findings: Gender pay gap in tech', likes: 73, type: 'post' },
    { id: 15, image: '🎪', caption: 'Community festival: Celebrating diversity', likes: 124, type: 'reel' },
    { id: 16, image: '📱', caption: 'Digital literacy workshop for women', likes: 56, type: 'story' },
    { id: 17, image: '🏛️', caption: 'Policy advocacy at Parliament', likes: 91, type: 'post' },
    { id: 18, image: '🎵', caption: 'Feminist poetry night highlights', likes: 68, type: 'reel' },
    { id: 19, image: '📺', caption: 'TV interview: Discussing SRHR rights', likes: 145, type: 'post' },
    { id: 20, image: '🎓', caption: 'Graduation ceremony: Legal Vanguard cohort', likes: 112, type: 'story' },
    { id: 21, image: '🌱', caption: 'Environmental justice: Women and climate', likes: 79, type: 'reel' },
    { id: 22, image: '📰', caption: 'Media training: Amplifying our voices', likes: 63, type: 'post' },
    { id: 23, image: '🎨', caption: 'Art therapy session: Healing through creativity', likes: 84, type: 'story' },
    { id: 24, image: '🏃‍♀️', caption: '5K run for women\'s health awareness', likes: 97, type: 'reel' },
    { id: 25, image: '📚', caption: 'New research: Intersectionality in African feminism', likes: 71, type: 'post' },
    { id: 26, image: '🎪', caption: 'Youth summit: Next generation leaders', likes: 108, type: 'story' },
    { id: 27, image: '🎭', caption: 'Drama workshop: Role-playing for change', likes: 52, type: 'reel' },
    { id: 28, image: '📱', caption: 'App launch: Digital safety for women', likes: 89, type: 'post' },
    { id: 29, image: '🎵', caption: 'Music video: "Rise Up Sisters"', likes: 156, type: 'reel' },
    { id: 30, image: '📊', caption: 'Data visualization: Women in leadership', likes: 67, type: 'post' }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % instagramPosts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + instagramPosts.length) % instagramPosts.length);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % instagramPosts.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [instagramPosts.length, isPaused]);

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
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="flex space-x-4 overflow-hidden"
            animate={{ x: -currentIndex * 320 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {instagramPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 relative group cursor-pointer"
              >
                {/* Media placeholder */}
                <div className="aspect-square rounded-2xl overflow-hidden group-hover:scale-105 transition-transform duration-300 relative">
                  <Image
                    src={post.type === 'reel' ? '/images/social-reel.svg' : post.type === 'story' ? '/images/social-story.svg' : '/images/social-post.svg'}
                    alt={`${post.type} - ${post.caption}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="text-sm font-semibold">
                        {post.type === 'reel' ? 'VIDEO' : post.type === 'story' ? 'STORY' : 'PHOTO'}
                      </div>
                      {post.type === 'reel' && (
                        <div className="absolute bottom-3 right-3 text-xs text-white font-bold bg-black/30 px-2 py-1 rounded">0:45</div>
                      )}
                      {post.type === 'story' && (
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
                        href="https://www.instagram.com/equalityvanguard/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <span className="text-2xl">❤️</span>
                      </a>
                      <a
                        href="https://www.instagram.com/equalityvanguard/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                      >
                        <span className="text-2xl">💬</span>
                      </a>
                      <a
                        href="https://www.instagram.com/equalityvanguard/"
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
                      post.type === 'reel' ? 'bg-brand-orange text-white' :
                      post.type === 'story' ? 'bg-brand-yellow text-brand-teal' :
                      'bg-white/40 text-white'
                    }`}>
                      {post.type === 'reel' ? '🎥' : post.type === 'story' ? '📱' : '📸'}
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
          {Array.from({ length: Math.ceil(instagramPosts.length / 3) }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * 3)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 3) === i 
                  ? 'bg-brand-yellow scale-125' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Post counter */}
        <div className="text-center mt-4">
          <span className="text-sm text-white/70">
            {currentIndex + 1} of {instagramPosts.length} posts
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/equalityvanguard"
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
