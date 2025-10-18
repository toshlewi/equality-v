'use client';

import { ScrollStackAdvanced } from '@/components/get-involved/ScrollStackAdvanced';
import { PageHeader } from '@/components/get-involved/PageHeader';
import { FooterLocal } from '@/components/get-involved/FooterLocal';

export default function GetInvolvedPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <main className="relative">
        <ScrollStackAdvanced />
      </main>
      <FooterLocal />
    </div>
  );
}

