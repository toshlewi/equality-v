"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";

// Scroll-based reveal animation for sections
export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0,
  duration = 0.6,
  distance = 50
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  distance?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { y: 0, x: distance },
    right: { y: 0, x: -distance }
  };

  const initial = directionMap[direction];
  const animate = { y: 0, x: 0 };

  return (
    <motion.div
      ref={ref}
      initial={{ ...initial, opacity: 0 }}
      animate={isInView ? { ...animate, opacity: 1 } : { ...initial, opacity: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

// Parallax scroll effect for background elements
export function ParallaxScroll({ 
  children, 
  speed = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered animation for grid items
export function StaggeredGrid({ 
  children, 
  staggerDelay = 0.1,
  className = ""
}: {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.6, 
            delay: index * staggerDelay,
            type: "spring",
            stiffness: 100
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Scale on scroll effect
export function ScaleOnScroll({ 
  children, 
  scale = 0.8,
  className = ""
}: {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [scale, 1, scale]);

  return (
    <motion.div
      ref={ref}
      style={{ scale: scaleValue }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade in with slide effect
export function FadeInSlide({ 
  children, 
  direction = "up",
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionMap = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ ...directionMap[direction], opacity: 0 }}
      animate={isInView ? { y: 0, x: 0, opacity: 1 } : { ...directionMap[direction], opacity: 0 }}
      transition={{ 
        duration: 0.8, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Rotate on scroll effect
export function RotateOnScroll({ 
  children, 
  rotation = 5,
  className = ""
}: {
  children: React.ReactNode;
  rotation?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, rotation]);

  return (
    <motion.div
      ref={ref}
      style={{ rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Blur effect on scroll
export function BlurOnScroll({ 
  children, 
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [0, 5, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ filter: `blur(${blur}px)` }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Progress bar that fills as you scroll
export function ScrollProgress({ 
  className = ""
}: {
  className?: string;
}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-brand-yellow origin-left z-50 ${className}`}
      style={{ scaleX }}
    />
  );
}

// Text that reveals character by character
export function RevealText({ 
  text, 
  className = "",
  delay = 0
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

// Floating animation for decorative elements
export function FloatingElement({ 
  children, 
  intensity = 10,
  speed = 2,
  className = ""
}: {
  children: React.ReactNode;
  intensity?: number;
  speed?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -intensity, 0],
        rotate: [0, 2, 0]
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
