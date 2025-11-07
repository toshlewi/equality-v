'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/our-work', label: 'Our Work' },
    { href: '/matriarchive', label: 'MatriArchive' },
    { href: '/our-voices', label: 'Our Voices' },
    { href: '/events-news', label: 'Events & News' },
    { href: '/get-involved', label: 'Get Involved' },
  ];

  // Close menu when pathname changes (navigation occurs)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-[#042C45] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center">
            <span className="sr-only">Equality Vanguard</span>
            <Image
              src="/images/EV ROUND LOGO.png"
              alt="Equality Vanguard logo"
              width={150}
              height={150}
              priority
              className="w-[5.9rem] h-[5.9rem] sm:w-[6rem] sm:h-[6rem] object-contain"
            />
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
              <Link 
                key={link.href} 
                href={link.href} 
                className="block py-2 hover:text-brand-yellow"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
