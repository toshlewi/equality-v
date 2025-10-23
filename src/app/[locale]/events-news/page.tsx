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

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number | null;
  image: string;
  category: string;
  description: string;
  instructor?: string;
  featured?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
  featured?: boolean;
}

export default function EventsNewsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with API calls
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Feminist Legal Theory Workshop",
        date: "2024-02-15",
        time: "10:00 AM - 4:00 PM",
        location: "Nairobi, Kenya",
        price: 2500,
        image: "/images/place1 (1).jpg",
        category: "Workshops",
        description: "Join us for an intensive workshop on feminist legal theory and its practical applications in contemporary legal practice. This workshop will explore intersectional approaches to law and justice.",
        instructor: "Dr. Sylvia Tamale",
        featured: true
      },
      {
        id: "2",
        title: "Digital Rights & Privacy Discussion",
        date: "2024-02-20",
        time: "6:00 PM - 8:00 PM",
        location: "Online",
        price: null,
        image: "/images/place1 (2).jpg",
        category: "Talks",
        description: "A panel discussion on digital rights, privacy, and how they intersect with gender justice in the digital age.",
        instructor: "Tech Team",
        featured: false
      },
      {
        id: "3",
        title: "Art for Change Exhibition",
        date: "2024-02-25",
        time: "2:00 PM - 6:00 PM",
        location: "Alliance Française, Nairobi",
        price: 500,
        image: "/images/place1 (3).jpg",
        category: "Exhibitions",
        description: "An exhibition showcasing feminist art from across Africa, exploring themes of resistance, resilience, and reimagining.",
        instructor: "Creative Collective",
        featured: true
      },
      {
        id: "4",
        title: "Economic Justice Webinar",
        date: "2024-03-01",
        time: "7:00 PM - 8:30 PM",
        location: "Online",
        price: null,
        image: "/images/place1 (4).jpg",
        category: "Virtual Events",
        description: "Understanding the intersection of economic policy and gender justice in African contexts.",
        instructor: "Dr. Amina Hassan",
        featured: false
      },
      {
        id: "5",
        title: "SRHR Advocacy Training",
        date: "2024-03-10",
        time: "9:00 AM - 5:00 PM",
        location: "Kampala, Uganda",
        price: 3000,
        image: "/images/place1 (5).jpg",
        category: "Workshops",
        description: "Comprehensive training on sexual and reproductive health and rights advocacy strategies.",
        instructor: "SRHR Team",
        featured: false
      },
      {
        id: "6",
        title: "Climate Justice & Gender",
        date: "2024-03-15",
        time: "3:00 PM - 5:00 PM",
        location: "Lagos, Nigeria",
        price: 1000,
        image: "/images/place1 (6).jpg",
        category: "Talks",
        description: "Exploring the gendered impacts of climate change and feminist approaches to climate justice.",
        instructor: "Environmental Team",
        featured: true
      }
    ];

    const mockNews: NewsItem[] = [
      {
        id: "1",
        title: "Equality Vanguard Launches New Legal Vanguard Program",
        excerpt: "Our newest initiative brings together legal minds committed to decolonizing legal thought and advancing gender justice.",
        date: "2024-01-15",
        image: "/images/place1 (7).jpg",
        category: "Announcements",
        featured: true
      },
      {
        id: "2",
        title: "ALKAH Book Club: February Reading List",
        excerpt: "This month we're diving into 'Decolonization and Afrofeminism' by Dr. Sylvia Tamale.",
        date: "2024-01-20",
        image: "/images/place1 (8).jpg",
        category: "Updates",
        featured: false
      },
      {
        id: "3",
        title: "Partnership with Nobel Women's Initiative",
        excerpt: "We're excited to announce our collaboration with the Nobel Women's Initiative on advancing women's rights globally.",
        date: "2024-01-25",
        image: "/images/place1 (9).jpg",
        category: "Partnerships",
        featured: true
      },
      {
        id: "4",
        title: "Digital Rights Report Published",
        excerpt: "Our latest research on digital rights and gender justice in Africa is now available.",
        date: "2024-02-01",
        image: "/images/place1 (10).jpg",
        category: "Publications",
        featured: false
      }
    ];

    setEvents(mockEvents);
    setNews(mockNews);
    setLoading(false);
  }, []);

  // Filter events based on category and search
  const filteredEvents = events.filter(event => {
    const matchesCategory = filter === "All" || event.category === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
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
            {filteredEvents.map((event) => (
              <div key={event.id} className="event-card">
                <EventCard
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              </div>
            ))}
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
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <LocalFooter />
    </div>
  );
}
