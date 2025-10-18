"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LocalHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-lg backdrop-blur-md bg-opacity-95"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/logo.png"
                alt="Equality Vanguard Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-fredoka text-xl font-bold text-brand-teal">
              Equality Vanguard
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/events-news"
              className={`font-medium transition-colors duration-200 ${
                isScrolled
                  ? "text-brand-teal hover:text-brand-orange"
                  : "text-white hover:text-brand-yellow"
              }`}
            >
              Upcoming Events
            </Link>
            <Link
              href="/events-news#news"
              className={`font-medium transition-colors duration-200 ${
                isScrolled
                  ? "text-brand-teal hover:text-brand-orange"
                  : "text-white hover:text-brand-yellow"
              }`}
            >
              News and Updates
            </Link>
            <Link
              href="/our-voices"
              className={`font-medium transition-colors duration-200 ${
                isScrolled
                  ? "text-brand-teal hover:text-brand-orange"
                  : "text-white hover:text-brand-yellow"
              }`}
            >
              Our Voices
            </Link>
            <Link
              href="/matriarchive"
              className={`font-medium transition-colors duration-200 ${
                isScrolled
                  ? "text-brand-teal hover:text-brand-orange"
                  : "text-white hover:text-brand-yellow"
              }`}
            >
              MatriArchive
            </Link>
            <Link
              href="/get-involved"
              className={`font-medium transition-colors duration-200 ${
                isScrolled
                  ? "text-brand-teal hover:text-brand-orange"
                  : "text-white hover:text-brand-yellow"
              }`}
            >
              Get Involved
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
