'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Instagram, Linkedin, ArrowUp } from 'lucide-react';

export default function MatriArchiveFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t mt-16" style={{ borderColor: '#FF7D05' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Only */}
          <div className="md:col-span-1">
            <Link href="/matriarchive" className="flex items-center justify-center md:justify-start mb-4">
              <div className="relative w-40 h-40">
                <Image
                  src="/images/logo.png"
                  alt="Equality Vanguard Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-600 font-spartan text-center md:text-left">
              Your central hub for feminist knowledge, research, and community resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-fredoka text-lg font-semibold mb-4" style={{ color: '#042C45' }}>
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/our-work" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Our Work
                </Link>
              </li>
              <li>
                <Link href="/events-news" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Events & News
                </Link>
              </li>
              <li>
                <Link href="/get-involved" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Get Involved
                </Link>
              </li>
              <li>
                <Link href="/our-work/legal-vanguard" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Legal Vanguard
                </Link>
              </li>
            </ul>
          </div>

          {/* MatriArchive Sections */}
          <div>
            <h3 className="font-fredoka text-lg font-semibold mb-4" style={{ color: '#042C45' }}>
              MatriArchive
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/matriarchive/publications" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/matriarchive/alkah-library" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  ALKAH Library
                </Link>
              </li>
              <li>
                <Link href="/matriarchive/toolkits-guides" className="text-sm text-gray-600 hover:text-brand-yellow transition-colors font-spartan">
                  Toolkits & Guides
                </Link>
              </li>
            </ul>
          </div>

           {/* Social Links */}
           <div>
             <h3 className="font-fredoka text-lg font-semibold mb-4" style={{ color: '#042C45' }}>
               Connect
             </h3>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com/equalityvanguard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-brand-yellow transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/equalityvanguard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-brand-yellow transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/company/equalityvanguard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-brand-yellow transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

         {/* Bottom Section */}
         <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center" style={{ borderColor: '#FF7D05' }}>
           <p className="text-sm font-spartan" style={{ color: '#042C45' }}>
             &copy; {new Date().getFullYear()} Equality Vanguard. All rights reserved.
           </p>
           <button
             onClick={scrollToTop}
             className="mt-4 md:mt-0 flex items-center gap-1 text-sm hover:text-brand-yellow transition-colors font-spartan"
             style={{ color: '#042C45' }}
           >
             <ArrowUp className="w-4 h-4" />
             Back to top
           </button>
         </div>
      </div>
    </footer>
  );
}
