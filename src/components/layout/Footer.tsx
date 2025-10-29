'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Send } from 'lucide-react';
import { TikTok } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className="bg-brand-teal text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Get Involved Section */}
          <div>
            <h3 className="font-fredoka text-xl mb-6 text-brand-yellow">Get Involved</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs-volunteer" className="hover:text-brand-yellow transition-colors">
                  Jobs & Volunteer
                </Link>
              </li>
              <li>
                <Link href="/buy-merch" className="hover:text-brand-yellow transition-colors">
                  Buy Merch
                </Link>
              </li>
              <li>
                <Link href="/get-involved#donate" className="hover:text-brand-yellow transition-colors">
                  Donate & Support Our Work
                </Link>
              </li>
              <li>
                <Link href="/get-involved#partner" className="hover:text-brand-yellow transition-colors">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link href="/get-involved#membership" className="hover:text-brand-yellow transition-colors">
                  Join the Movement
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <h3 className="font-fredoka text-xl mb-6 text-brand-yellow">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/matriarchive/publications" className="hover:text-brand-yellow transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/our-work/alkah-book-club" className="hover:text-brand-yellow transition-colors">
                  ALKAH Book Club
                </Link>
              </li>
              <li>
                <Link href="/our-voices" className="hover:text-brand-yellow transition-colors">
                  Our Voices
                </Link>
              </li>
              <li>
                <Link href="/our-voices#tell-story" className="hover:text-brand-yellow transition-colors">
                  Tell Your Story
                </Link>
              </li>
              <li>
                <Link href="/events-news" className="hover:text-brand-yellow transition-colors">
                  Events & News
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-fredoka text-xl mb-6 text-brand-yellow">About</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-brand-yellow transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about#team" className="hover:text-brand-yellow transition-colors">
                  Meet the Team
                </Link>
              </li>
              <li>
                <Link href="/our-work" className="hover:text-brand-yellow transition-colors">
                  Our Work
                </Link>
              </li>
              <li>
                <Link href="/matriarchive" className="hover:text-brand-yellow transition-colors">
                  MatriArchive
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Legal Section */}
          <div>
            <h3 className="font-fredoka text-xl mb-6 text-brand-yellow">Contact & Legal</h3>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-brand-yellow" />
                <a href="mailto:info@equalityvanguard.org" className="hover:text-brand-yellow transition-colors">
                  info@equalityvanguard.org
                </a>
              </div>

              {/* Newsletter Subscription */}
              <div>
                <h4 className="font-semibold mb-2 text-brand-yellow">Newsletter</h4>
                <form onSubmit={handleNewsletterSubmit} className="flex space-x-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-brand-yellow text-brand-teal px-3 py-2 rounded hover:bg-brand-yellow/90 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Legal Links */}
              <div className="pt-4 space-y-2">
                <Link href="/data-protection" className="block hover:text-brand-yellow transition-colors text-sm">
                  Data Protection
                </Link>
                <Link href="/terms" className="block hover:text-brand-yellow transition-colors text-sm">
                  Terms & Conditions
                </Link>
                <Link href="/privacy" className="block hover:text-brand-yellow transition-colors text-sm">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6">
              <a 
                href="https://www.facebook.com/share/1G4xk69DFp/?mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors" 
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="https://x.com/vanguardequal?s=11" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors" 
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/vanguardequal/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors" 
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/company/equality-vanguard/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors" 
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
              <a 
                href="https://www.tiktok.com/@equalityvanguard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-brand-yellow transition-colors" 
                aria-label="TikTok"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
            <p className="text-center md:text-right text-sm">
              &copy; {new Date().getFullYear()} Equality Vanguard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
