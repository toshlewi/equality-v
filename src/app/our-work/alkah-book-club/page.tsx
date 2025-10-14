'use client';

import { motion } from 'framer-motion';
import WorkPageLayout from '@/components/layout/WorkPageLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const featuredBooks = [
  {
    title: "Purple Hibiscus",
    author: "Chimamanda Ngozi Adichie",
    cover: "/images/purple-hibiscus.jpeg",
    description: "A powerful coming-of-age story that explores themes of family, religion, and political upheaval in Nigeria."
  },
  {
    title: "The Sex Lives of African Women",
    author: "Nana Darkoa Sekyiamah",
    cover: "/images/The-sex-lives-of-african women.jpeg",
    description: "An intimate collection of stories about African women's sexual experiences and relationships."
  },
  {
    title: "Decolonization and Afrofeminism",
    author: "Dr. Sylvia Tamale",
    cover: "/images/Decolonization-and-afrofeminism.jpeg",
    description: "A critical examination of decolonial feminist thought and its application in African contexts."
  },
  {
    title: "All About Love",
    author: "Bell Hooks",
    cover: "/images/all-about-love.jpeg",
    description: "A transformative exploration of love in all its forms and its role in creating a just society."
  }
];

export default function ALKAHBookClubPage() {
  return (
    <WorkPageLayout
      title="ALKAH Book Club"
      subtitle="Feminist literature space where knowledge moves from theory to praxis through transformative reading"
      heroImage="/images/Decolonization-and-afrofeminism.jpeg"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-16"
      >
        {/* Introduction */}
        <motion.section variants={fadeInUp} className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-brand-teal mb-6">The ALKAH Book Club</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Equality Vanguard, we believe that reading is not passive. Rather, it is a radical act of resistance and imagination. That belief gave rise to the ALKAH Book Club, our feminist literature space where knowledge moves from theory to praxis.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            The name ALKAH invokes alchemy, the ancient science of transformation. Just as alchemists sought to transmute base metals into gold, ALKAH exists as a space where silence becomes voice, where erasure gives way to remembrance, and where knowledge is refined into collective power.
          </p>
        </motion.section>

        {/* The Alchemy of Reading */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">The Alchemy of Reading</h3>
            <p className="text-xl leading-relaxed mb-8">
              Through ALKAH, the words of Audre Lorde, Ama Ata Aidoo, Dr. Sylvia Tamale, and other Pan-African foremothers become both catalyst and compass. Their works do not simply inform; they ignite. Within these sessions, members become co-alchemists, undertaking the slow burn of consciousness-raising, turning ideas into action, and imagining feminist futures together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/events-news">
                <Button 
                  size="lg" 
                  className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
                >
                  Join Our Next Session
                </Button>
              </Link>
              <Link href="/matriarchive/book-suggestions">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600"
                >
                  Suggest a Book
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Featured Books */}
        <motion.section variants={fadeInUp}>
          <h3 className="text-3xl font-bold text-brand-teal mb-8 text-center">Featured Books</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.title}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    width={200}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold text-brand-teal mb-2">{book.title}</h4>
                <p className="text-sm text-gray-600 mb-3">by {book.author}</p>
                <p className="text-sm text-gray-700">{book.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Library Connection */}
        <motion.section variants={fadeInUp} className="bg-white rounded-2xl p-12 shadow-lg">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-brand-teal mb-6">Connected to Our Library</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Our Book Club is also connected to our library repository, a living archive of recommended readings in our focus areas: sexual and reproductive health and rights (SRHR), economic justice, gender justice, and digital rights. It is a resource and a reminder that justice begins with learning, and that learning is most powerful when shared.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/matriarchive/alkah-library">
                <Button 
                  size="lg" 
                  className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
                >
                  Explore the Book Library
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white px-8 py-4 text-lg"
              >
                Join Our Community
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Upcoming Sessions */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-8 text-center">Upcoming Book Club Sessions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-xl p-6">
              <h4 className="text-xl font-semibold mb-3">The Looting Machine by Tom Burgis</h4>
              <p className="text-white/90 mb-4">Exploring the hidden networks that plunder Africa's wealth and the role of extractive industries in perpetuating inequality.</p>
              <div className="text-sm text-white/80">
                <p>Date: [To be announced]</p>
                <p>Location: [Online/In-person]</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <h4 className="text-xl font-semibold mb-3">Unbowed: One Woman's Story by Wangari Maathai</h4>
              <p className="text-white/90 mb-4">The inspiring memoir of the Nobel Peace Prize winner and environmental activist who founded the Green Belt Movement.</p>
              <div className="text-sm text-white/80">
                <p>Date: [To be announced]</p>
                <p>Location: [Online/In-person]</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Community Impact */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-brand-teal mb-6">More Than a Book Club</h3>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              ALKAH is not just a book club. It is a community of resistance, remembrance, and renewal. Through our shared reading and discussion, we:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-brand-yellow mr-3 mt-1">•</span>
                <span className="text-gray-700">Build collective consciousness around feminist and Pan-African issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-yellow mr-3 mt-1">•</span>
                <span className="text-gray-700">Create safe spaces for critical dialogue and reflection</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-yellow mr-3 mt-1">•</span>
                <span className="text-gray-700">Transform knowledge into action through community organizing</span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-yellow mr-3 mt-1">•</span>
                <span className="text-gray-700">Honor the intellectual contributions of Pan-African feminist foremothers</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h4 className="text-2xl font-bold text-brand-teal mb-4">Join ALKAH</h4>
            <p className="text-gray-700 mb-6">
              Ready to become a co-alchemist in our transformative reading community? Join us for our next session and be part of the slow burn of consciousness-raising.
            </p>
            <div className="space-y-4">
              <Link href="/events-news">
                <Button className="w-full bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white">
                  Join Our Next Session
                </Button>
              </Link>
              <Link href="/matriarchive/book-suggestions">
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  Suggest a Book
                </Button>
              </Link>
              <Link href="/matriarchive/alkah-library">
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
                  Browse Our Library
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Ready to Join ALKAH?</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Whether you're a seasoned reader or new to feminist literature, ALKAH welcomes all who are ready to engage in the transformative power of collective reading and discussion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved/membership">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              >
                Join ALKAH
              </Button>
            </Link>
            <Link href="/matriarchive/alkah-library">
              <Button 
                size="lg" 
                variant="outline"
                className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white px-8 py-4 text-lg"
              >
                Explore the Book Library
              </Button>
            </Link>
          </div>
        </motion.section>
      </motion.div>
    </WorkPageLayout>
  );
}
