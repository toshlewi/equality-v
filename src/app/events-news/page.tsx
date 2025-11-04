"use client";

import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocalHeader from "@/components/events-news/LocalHeader";
import Hero from "@/components/events-news/Hero";
import EventCard from "@/components/events-news/EventCard";
import EventModal from "@/components/events-news/EventModal";
import PastEventsCarousel from "@/components/events-news/PastEventsCarousel";
import NewsGrid from "@/components/events-news/NewsGrid";
import LocalFooter from "@/components/events-news/LocalFooter";

// Register GSAP ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface EventApiItem {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: { name?: string; city?: string; country?: string; isVirtual?: boolean };
  price?: number;
  isFree: boolean;
  featuredImage?: string;
  category: string;
  description: string;
}

interface NewsItem { _id: string; title: string; excerpt?: string; featuredImage?: string; category: string; publishedAt?: string; }

export default function EventsNewsPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventApiItem | null>(null);
  const [events, setEvents] = useState<EventApiItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [evRes, newsRes] = await Promise.all([
          fetch('/api/events?status=published', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).catch(() => null),
          fetch('/api/news?status=published', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } }).catch(() => null)
        ]);
        if (evRes && evRes.ok) {
          const evJson = await evRes.json();
          if (evJson?.success) setEvents(evJson.data.events || []);
        } else {
          setEvents([]);
        }
        if (newsRes && newsRes.ok) {
          const newsJson = await newsRes.json();
          if (newsJson?.success) setNews(newsJson.data.news || []);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error('Failed to fetch events/news:', error);
        setEvents([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter events based on category and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = filter === "All" || event.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // GSAP ScrollTrigger animations
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Calendar scroll effect
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach((card, index) => {
      gsap.fromTo(card, 
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Parallax hero effect
    const heroParallax = document.querySelector('.hero-parallax');
    if (heroParallax) {
      gsap.to('.hero-parallax', {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: '.hero-parallax',
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LocalHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
        </div>
        <LocalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      <LocalHeader />
      
      <Hero />
      
      {/* Events Section */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter Bar */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {["All", "Workshops", "Talks", "Exhibitions", "Virtual Events"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      filter === category
                        ? "bg-brand-yellow text-brand-teal"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const start = event.startDate ? new Date(event.startDate) : null;
              const time = start
                ? start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                : "";
              const locationLabel = event.location
                ? (event.location.isVirtual
                    ? "Virtual"
                    : [event.location.name, event.location.city, event.location.country]
                        .filter(Boolean)
                        .join(", "))
                : "";
              const mappedEvent = {
                id: event._id,
                title: event.title,
                date: event.startDate,
                time,
                location: locationLabel,
                price: event.isFree ? null : (event.price ?? null),
                image: event.featuredImage || "",
                category: event.category,
                description: event.description,
                instructor: undefined,
                featured: false,
              };
              return (
                <div key={event._id} className="event-card">
                  <EventCard
                    event={mappedEvent}
                    onClick={() => setSelectedEvent(event)}
                  />
                </div>
              );
            })}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Past Events Section */}
      <PastEventsCarousel />

      {/* News Section */}
      <section id="news">
        <NewsGrid news={news} />
      </section>

      {/* Event Modal */}
      {selectedEvent && (() => {
        const start = selectedEvent.startDate ? new Date(selectedEvent.startDate) : null;
        const time = start
          ? start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "";
        const locationLabel = selectedEvent.location
          ? (selectedEvent.location.isVirtual
              ? "Virtual"
              : [selectedEvent.location.name, selectedEvent.location.city, selectedEvent.location.country]
                  .filter(Boolean)
                  .join(", "))
          : "";
        const modalEvent = {
          id: selectedEvent._id,
          title: selectedEvent.title,
          date: selectedEvent.startDate,
          time,
          location: locationLabel,
          price: selectedEvent.isFree ? null : (selectedEvent.price ?? null),
          image: selectedEvent.featuredImage || "",
          category: selectedEvent.category,
          description: selectedEvent.description,
          instructor: undefined,
          featured: false,
        };
        return (
          <EventModal
            event={modalEvent as any}
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        );
      })()}

      <LocalFooter />
    </div>
  );
}
