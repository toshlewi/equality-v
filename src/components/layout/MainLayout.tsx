"use client";
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import LiquidBackground from '../ui/LiquidBackground';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isMatriArchive = pathname?.startsWith('/matriarchive');
  const isEventsNews = pathname?.startsWith('/events-news');
  
  return (
    <>
      <LiquidBackground />
      {!isAdmin && !isMatriArchive && <Navbar />}
      <main className="min-h-screen relative z-10">{children}</main>
      {!isAdmin && !isMatriArchive && !isEventsNews && <Footer />}
    </>
  );
}
