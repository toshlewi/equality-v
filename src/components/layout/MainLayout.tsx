import Navbar from './Navbar';
import Footer from './Footer';
import LiquidBackground from '../ui/LiquidBackground';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiquidBackground />
      <Navbar />
      <main className="min-h-screen relative z-10">{children}</main>
      <Footer />
    </>
  );
}
