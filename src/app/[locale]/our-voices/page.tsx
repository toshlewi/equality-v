"use client";

import { motion } from "framer-motion";
import HeroSection from "@/components/our-voices/HeroSection";
import VideoResourcesSection from "@/components/our-voices/VideoResourcesSection";
import AudioPodcastsSection from "@/components/our-voices/AudioPodcastsSection";
import YourStoriesSection from "@/components/our-voices/YourStoriesSection";
import TellYourStorySection from "@/components/our-voices/TellYourStorySection";
import { ScrollProgress, ScrollReveal, ParallaxScroll } from "@/components/our-voices/ScrollAnimations";

export default function OurVoicesPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      {/* Parallax Background Elements */}
      <ParallaxScroll speed={0.3} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-yellow/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-brand-orange/10 rounded-full blur-xl" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-brand-teal/10 rounded-full blur-xl" />
      </ParallaxScroll>

      {/* Hero Section */}
      <section id="hero">
        <ScrollReveal direction="up" delay={0.2}>
          <HeroSection />
        </ScrollReveal>
      </section>

      {/* Video Resources Section */}
      <section id="video-resources">
        <ScrollReveal direction="up" delay={0.1}>
          <VideoResourcesSection />
        </ScrollReveal>
      </section>

      {/* Audio & Podcasts Section */}
      <section id="audio-podcasts">
        <ScrollReveal direction="up" delay={0.1}>
          <AudioPodcastsSection />
        </ScrollReveal>
      </section>

      {/* Your Stories Section */}
      <section id="your-stories">
        <ScrollReveal direction="up" delay={0.1}>
          <YourStoriesSection />
        </ScrollReveal>
      </section>

      {/* Tell Your Story Section */}
      <section id="tell-your-story" className="pb-0">
        <ScrollReveal direction="up" delay={0.1}>
          <TellYourStorySection />
        </ScrollReveal>
      </section>
    </div>
  );
}
