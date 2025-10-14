'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/our-work', label: 'Our Work' },
    { href: '/matriarchive', label: 'MatriArchive' },
    { href: '/our-voices', label: 'Our Voices' },
    { href: '/events', label: 'Events/News' },
    { href: '/get-involved', label: 'Get Involved' },
  ];

  return (
    <nav className="bg-brand-teal text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-fredoka text-2xl font-bold text-brand-yellow">
            Equality Vanguard
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-yellow transition">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block py-2 hover:text-brand-yellow">
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
