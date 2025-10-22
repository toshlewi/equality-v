'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FileText, Book, Wrench, ArrowLeft, Menu, X } from 'lucide-react';

export default function MatriArchiveHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu when pathname changes (navigation occurs)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  const navLinks = [
    { 
      href: '/matriarchive/publications', 
      label: 'Publications', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      href: '/matriarchive/alkah-library', 
      label: 'Alkah Library', 
      icon: <Book className="w-5 h-5" /> 
    },
    { 
      href: '/matriarchive/toolkits-guides', 
      label: 'Toolkits & Guides', 
      icon: <Wrench className="w-5 h-5" /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: '#FF7D05' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/matriarchive" className="flex items-center space-x-3">
            <div className="relative w-32 h-32">
              <Image
                src="/images/logo.png"
                alt="Equality Vanguard Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-fredoka text-2xl font-bold" style={{ color: '#042C45' }}>
              MatriArchive
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-spartan transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-brand-yellow text-brand-teal font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-brand-teal'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {/* Back to Main Site Link */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-spartan text-gray-600 hover:bg-gray-100 hover:text-brand-teal transition-colors ml-4 border-l border-gray-200 pl-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Site</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-yellow rounded-lg p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: '#FF7D05' }}>
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-spartan transition-colors ${
                    pathname.startsWith(link.href)
                      ? 'bg-brand-yellow text-brand-teal font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-brand-teal'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Back to Main Site Link - Mobile */}
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-spartan text-gray-600 hover:bg-gray-100 hover:text-brand-teal transition-colors border-t pt-4 mt-2"
                style={{ borderColor: '#FF7D05' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Main Site</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
