'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FileText, Book, Wrench, ArrowLeft } from 'lucide-react';

export default function MatriArchiveHeader() {
  const pathname = usePathname();
  
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
              className="text-gray-700 hover:text-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-yellow rounded-lg p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-4" style={{ borderColor: '#FF7D05' }}>
          <nav className="flex flex-col space-y-2">
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
            
            {/* Back to Main Site Link - Mobile */}
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-spartan text-gray-600 hover:bg-gray-100 hover:text-brand-teal transition-colors border-t pt-4 mt-2"
              style={{ borderColor: '#FF7D05' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Site</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
