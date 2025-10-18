"use client";

import { motion } from "framer-motion";
import { useState } from "react";
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

  // Mock data for past events
  const pastEvents: PastEvent[] = [
    {
      id: "1",
      title: "Feminist Legal Theory Workshop",
      date: "2024-01-15",
      location: "Nairobi, Kenya",
      image: "/images/place1 (11).jpg",
      type: "gallery",
      featured: true
    },
    {
      id: "2",
      title: "Digital Rights Panel Discussion",
      date: "2024-01-10",
      location: "Online",
      image: "/images/place1 (12).jpg",
      type: "video",
      recapUrl: "/videos/digital-rights-panel.mp4",
      featured: false
    },
    {
      id: "3",
      title: "Art for Change Exhibition",
      date: "2024-01-05",
      location: "Alliance Française, Nairobi",
      image: "/images/place1 (13).jpg",
      type: "gallery",
      featured: true
    },
    {
      id: "4",
      title: "Economic Justice Webinar",
      date: "2023-12-20",
      location: "Online",
      image: "/images/place1 (14).jpg",
      type: "video",
      recapUrl: "/videos/economic-justice-webinar.mp4",
      featured: false
    },
    {
      id: "5",
      title: "SRHR Advocacy Training",
      date: "2023-12-15",
      location: "Kampala, Uganda",
      image: "/images/place1 (15).jpg",
      type: "gallery",
      featured: false
    },
    {
      id: "6",
      title: "Climate Justice & Gender Talk",
      date: "2023-12-10",
      location: "Lagos, Nigeria",
      image: "/images/place1 (16).jpg",
      type: "video",
      recapUrl: "/videos/climate-justice-talk.mp4",
      featured: true
    }
  ];

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

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex space-x-6 overflow-x-auto scrollbar-none pb-4">
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
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
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

          {/* Scroll indicators */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4">
            <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4">
            <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
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
                    <p className="text-gray-600">Video recap coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {selectedEvent.recapUrl}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
