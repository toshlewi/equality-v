"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Volume2,
  FileText,
  MessageSquare,
  Upload,
  Home
} from "lucide-react";

export default function OurVoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const menuItems = [
    { 
      name: "Hero", 
      href: "#hero", 
      icon: <Home className="w-5 h-5" />,
      description: "Featured content and stories"
    },
    { 
      name: "Video Resources", 
      href: "#video-resources", 
      icon: <Play className="w-5 h-5" />,
      description: "Educational videos and workshops"
    },
    { 
      name: "Audio & Podcasts", 
      href: "#audio-podcasts", 
      icon: <Volume2 className="w-5 h-5" />,
      description: "Podcasts and audio content"
    },
    { 
      name: "Your Stories", 
      href: "#your-stories", 
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Community stories and experiences"
    },
    { 
      name: "Tell Your Story", 
      href: "#tell-your-story", 
      icon: <Upload className="w-5 h-5" />,
      description: "Share your own story"
    },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsSidebarOpen(false);
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => item.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Link href="/" className="flex items-center space-x-3">
                    <Image
                      src="/images/logo.png"
                      alt="Equality Vanguard"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <div>
                      <h1 className="font-fredoka text-lg font-bold text-brand-teal">
                        Our Voices
                      </h1>
                      <p className="text-xs text-gray-500">Community Stories</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-6">
                  <div className="space-y-2">
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => scrollToSection(item.href)}
                        className={`w-full flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 group ${
                          activeSection === item.href.substring(1)
                            ? 'bg-brand-yellow text-brand-teal shadow-md'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-brand-orange'
                        }`}
                      >
                        <div className={`flex-shrink-0 ${
                          activeSection === item.href.substring(1)
                            ? 'text-brand-teal'
                            : 'text-gray-400 group-hover:text-brand-orange'
                        }`}>
                          {item.icon}
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">
                      Share your voice with our community
                    </p>
                    <button
                      onClick={() => scrollToSection('#tell-your-story')}
                      className="w-full bg-brand-yellow text-brand-teal px-4 py-2 rounded-lg font-medium hover:bg-brand-orange hover:text-white transition-colors text-sm"
                    >
                      Submit Your Story
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Floating Hamburger Button - Always Visible */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-20 left-6 z-30 bg-brand-yellow text-brand-teal p-4 rounded-full shadow-lg hover:bg-brand-orange hover:text-white transition-colors"
      >
        <Menu className="w-6 h-6" />
      </motion.button>
    </div>
  );
}
