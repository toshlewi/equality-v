import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-teal text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-fredoka text-xl mb-4 text-brand-yellow">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/our-work">Our Work</Link></li>
              <li><Link href="/get-involved">Get Involved</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-fredoka text-xl mb-4 text-brand-yellow">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/matriarchive/publications">Publications</Link></li>
              <li><Link href="/matriarchive/alkah-library">ALKAH Library</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-fredoka text-xl mb-4 text-brand-yellow">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms">Terms & Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-fredoka text-xl mb-4 text-brand-yellow">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-yellow"><Facebook /></a>
              <a href="#" className="hover:text-brand-yellow"><Twitter /></a>
              <a href="#" className="hover:text-brand-yellow"><Instagram /></a>
              <a href="#" className="hover:text-brand-yellow"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p>&copy; {new Date().getFullYear()} Equality Vanguard. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
