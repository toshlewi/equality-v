'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface WorkPageLayoutProps {
  title: string;
  subtitle?: string;
  heroImage: string;
  children: React.ReactNode;
  breadcrumbText?: string;
  breadcrumbHref?: string;
}

export default function WorkPageLayout({ 
  title, 
  subtitle, 
  heroImage, 
  children, 
  breadcrumbText = "Our Work",
  breadcrumbHref = "/our-work"
}: WorkPageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Breadcrumb */}
      <Container className="pt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link 
            href={breadcrumbHref}
            className="inline-flex items-center text-brand-teal hover:text-brand-orange transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {breadcrumbText}
          </Link>
        </motion.div>
      </Container>

      {/* Hero Section */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden">
        <Image
          src={heroImage}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-4">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl lg:text-2xl text-white/90 max-w-3xl">
                  {subtitle}
                </p>
              )}
            </motion.div>
          </Container>
        </div>
      </div>

      {/* Content */}
      <Container className="py-16">
        {children}
      </Container>
    </div>
  );
}
