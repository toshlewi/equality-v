"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

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

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return "Free";
    return `KSh ${price.toLocaleString()}`;
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className="bg-brand-yellow text-brand-teal px-3 py-1 rounded-full text-sm font-medium">
              {event.category}
            </span>
          </div>

          {/* Featured badge */}
          {event.featured && (
            <div className="absolute top-4 right-4">
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

          {/* Event details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-brand-orange" />
              <span className="text-sm">{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-brand-orange" />
              <span className="text-sm">{event.time}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-brand-orange" />
              <span className="text-sm">{event.location}</span>
            </div>
            {event.instructor && (
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-2 text-brand-orange" />
                <span className="text-sm">{event.instructor}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Price and Book button */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-brand-teal">
              {formatPrice(event.price)}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-brand-yellow text-brand-teal px-6 py-2 rounded-lg font-semibold transition-colors hover:bg-brand-orange hover:text-white"
            >
              Book Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
