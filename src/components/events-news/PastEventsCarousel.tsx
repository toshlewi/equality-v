"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Play, Image as ImageIcon, X } from "lucide-react";

interface PastEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  type: 'gallery' | 'video';
  recapUrl?: string;
  featured?: boolean;
}

export default function PastEventsCarousel() {
  const [selectedEvent, setSelectedEvent] = useState<PastEvent | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef(false);
  const bcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/events?time=past&limit=100', { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (!res.ok) {
          console.error('Failed to fetch past events:', res.status);
          return;
        }
        const json = await res.json();
        if (json.success) {
          // Show all published/completed past events
          // If showInPastCarousel is set, use that order, otherwise sort by endDate
          const selected = (json.data.events || [])
            .filter((e: any) => ['published', 'completed'].includes(e.status))
            .sort((a: any, b: any) => {
              // If both have showInPastCarousel and order, sort by order
              if (a.showInPastCarousel && b.showInPastCarousel) {
                return (a.pastCarouselOrder || 0) - (b.pastCarouselOrder || 0);
              }
              // Otherwise sort by endDate (most recent first)
              const dateA = a.endDate ? new Date(a.endDate).getTime() : 0;
              const dateB = b.endDate ? new Date(b.endDate).getTime() : 0;
              return dateB - dateA;
            });
          
          console.log('Loaded past events:', selected.length);
          
          const mapped: PastEvent[] = selected.map((e: any) => {
            const loc = e.location || {};
            const locationLabel = loc.isVirtual ? 'Virtual' : [loc.name, loc.city, loc.country].filter(Boolean).join(', ');
            const type = e.recap?.enabled ? (e.recap?.type || 'gallery') : 'gallery';
            return {
              id: e._id,
              title: e.title,
              date: e.endDate || e.startDate,
              location: locationLabel,
              image: e.featuredImage || e.bannerImage || '/images/placeholder.jpg',
              type,
              recapUrl: e.recap?.videoUrl,
              featured: !!e.featured,
            };
          });
          setPastEvents(mapped);
        } else {
          console.error('Failed to load past events:', json.message);
        }
      } catch (error) {
        console.error('Error loading past events:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
    
    // Set up BroadcastChannel listener
    bcRef.current = new BroadcastChannel('ev-events');
    bcRef.current.onmessage = (ev: MessageEvent) => {
      if (ev?.data?.type === 'past_events_updated') {
        console.log('Received past events update, refreshing...');
        load();
      }
    };
    
    return () => {
      if (bcRef.current) {
        bcRef.current.onmessage = null;
        bcRef.current.close();
      }
    };
  }, []);

  // Auto-scroll the horizontal carousel
  useEffect(() => {
    if (pastEvents.length === 0) return;
    
    const intervalRef = { current: null as NodeJS.Timeout | null };
    
    // Wait for DOM to be ready
    const timeoutId = setTimeout(() => {
      const container = scrollRef.current;
      if (!container) return;
      
      // Only auto-scroll if content overflows
      const hasOverflow = container.scrollWidth > container.clientWidth + 10;
      if (!hasOverflow) {
        console.log('No overflow, skipping auto-scroll');
        return;
      }
      
      const stepPx = 1; // pixels per tick - slower for smoother motion
      const tickMs = 30; // interval ms
      
      intervalRef.current = setInterval(() => {
        if (!container || hoverRef.current) return;
        
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = container.scrollLeft;
        
        // Reset to start when reaching the end
        if (currentScroll >= maxScroll - 5) {
          container.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          container.scrollLeft = currentScroll + stepPx;
        }
      }, tickMs);
      
      console.log('Auto-scroll started');
    }, 500); // Wait 500ms for DOM to be ready
    
    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pastEvents.length]);

  // Scroll functions for navigation buttons
  const scrollLeftHandler = () => {
    const container = scrollRef.current;
    if (!container) return;
    hoverRef.current = true; // Pause auto-scroll
    container.scrollBy({ left: -320, behavior: 'smooth' });
    setTimeout(() => { hoverRef.current = false; }, 1000); // Resume after 1 second
  };

  const scrollRightHandler = () => {
    const container = scrollRef.current;
    if (!container) return;
    hoverRef.current = true; // Pause auto-scroll
    container.scrollBy({ left: 320, behavior: 'smooth' });
    setTimeout(() => { hoverRef.current = false; }, 1000); // Resume after 1 second
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl md:text-5xl font-bold text-brand-teal mb-6">
            Past Events
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Relive the moments from our previous events, workshops, and discussions. 
            Each event brings us closer to our vision of gender justice.
          </p>
        </motion.div>

        {/* Past Events Carousel */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading past events...</p>
          </div>
        ) : pastEvents.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No past events yet.</p>
            <p className="text-sm mt-2">Published past events will appear here automatically.</p>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
              style={{ 
                scrollBehavior: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              onMouseEnter={() => { hoverRef.current = true; }}
              onMouseLeave={() => { hoverRef.current = false; }}
            >
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="flex-shrink-0 w-80 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Type indicator */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                        {event.type === 'video' ? (
                          <Play className="w-5 h-5 text-brand-orange" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-brand-orange" />
                        )}
                      </div>
                    </div>

                    {/* Featured badge */}
                    {event.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-brand-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-3 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-brand-orange" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-brand-orange" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-brand-yellow text-brand-teal py-2 rounded-lg font-semibold transition-colors hover:bg-brand-orange hover:text-white"
                    >
                      {event.type === 'video' ? 'Watch Recap' : 'View Gallery'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              ))}
            </div>

            {/* Scroll navigation buttons - only show if content overflows */}
            {pastEvents.length > 3 && (
              <>
                <button
                  onClick={scrollLeftHandler}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={scrollRightHandler}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Recap Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-fredoka text-2xl font-bold text-brand-teal">
                  {selectedEvent.title}
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedEvent.type === 'video' ? (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-brand-orange mx-auto mb-4" />
                    <p className="text-gray-600">Video recap available</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedEvent.recapUrl ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Gallery images coming soon</p>
                    </div>
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No gallery images available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
