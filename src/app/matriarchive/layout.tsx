import { ReactNode } from 'react';
import MatriArchiveHeader from '@/components/matriarchive/MatriArchiveHeader';
import MatriArchiveFooter from '@/components/matriarchive/MatriArchiveFooter';

export default function MatriArchiveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MatriArchiveHeader />
      <main className="flex-1">
        {children}
      </main>
      <MatriArchiveFooter />
    </div>
  );
}