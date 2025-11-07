"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function LocalFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com/equalityvanguard" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/equalityvanguard" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com/equalityvanguard" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/equalityvanguard" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "MatriArchive", href: "/matriarchive" },
    { name: "Our Voices", href: "/our-voices" },
    { name: "Get Involved", href: "/get-involved" },
  ];

  const legalLinks = [
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Data Protection", href: "/data-protection" },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/logo.png"
                  alt="Equality Vanguard Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>
              <span className="font-fredoka text-xl font-bold text-brand-teal">
                Equality Vanguard
              </span>
            </Link>
            <p className="text-brand-teal text-sm leading-relaxed mb-4">
              A Pan-African feminist collective dismantling oppression through law, art, 
              and radical community. We fuse legal advocacy with creative expression.
            </p>
            
            {/* Contact Info */}
            <div className="flex items-center text-brand-teal text-sm mb-2">
              <Mail className="w-4 h-4 mr-2 text-brand-orange" />
              <span>info@equalityvanguard.org</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="font-fredoka text-lg font-semibold text-brand-teal mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="font-fredoka text-lg font-semibold text-brand-teal mb-4">
              Our Work
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/our-work#alkah"
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  ALKAH Book Club
                </Link>
              </li>
              <li>
                <Link
                  href="/our-work#legal"
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  Legal Vanguard
                </Link>
              </li>
              <li>
                <Link
                  href="/our-work#digital"
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  Digital Rights
                </Link>
              </li>
              <li>
                <Link
                  href="/our-work#economic"
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  Economic Justice
                </Link>
              </li>
              <li>
                <Link
                  href="/our-work#srhr"
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  SRHR
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Social Links & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h3 className="font-fredoka text-lg font-semibold text-brand-teal mb-4">
              Connect With Us
            </h3>
            
            {/* Social Links */}
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-100 hover:bg-brand-yellow rounded-full flex items-center justify-center transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-brand-teal group-hover:text-brand-teal" />
                  </motion.a>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div>
              <p className="text-brand-teal text-sm mb-3">
                Stay updated with our latest news and events
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-brand-yellow text-brand-teal px-4 py-2 rounded-r-lg font-semibold text-sm hover:bg-brand-orange hover:text-white transition-colors"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 mt-8 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-brand-teal text-sm">
              © {currentYear} Equality Vanguard. All rights reserved.
            </div>
            
            <div className="flex space-x-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-brand-teal hover:text-brand-orange transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
