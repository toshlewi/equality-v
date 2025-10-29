'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  image: string;
  bio: string;
  fullBio: string;
  socialLinks?: {
    linkedin?: string;
    instagram?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    id: 'mutheu',
    name: 'Mutheu Mutuku',
    title: 'Visionary Founder & Creative Director',
    role: 'Founder',
    image: '/images/aMutheu.jpg',
    bio: 'A highly accomplished human rights lawyer focused on gender justice, feminist macroeconomics, and climate justice.',
    fullBio: `Mutheu Mutuku embodies the spirit of a dedicated seeker of justice. As a highly accomplished human rights lawyer, she has carved out a unique and impactful niche at the confluence of several critical global challenges.

Her work is strategically focused on the intricate connections between gender justice, feminist macroeconomics, and climate justice. Mutheu possesses a remarkable ability to translate complex legal principles and frameworks into tangible, public-facing initiatives. She consistently leverages her extensive legal expertise to design and execute impactful campaigns, influence policy development, and foster meaningful youth-led action.

Mutheu's influence extends to high-level international collaborations. She has forged significant partnerships with esteemed organizations such as the Nobel Women's Initiative, demonstrating her commitment to global peace and women's rights, and the Global Landscapes Forum, highlighting her dedication to environmental sustainability and land-use issues. Furthermore, her insightful contributions as a member of the EU–Kenya Youth Sounding Board underscore her direct role in shaping European Union policy that profoundly impacts young people in Kenya, always with a critical intersectional lens that ensures inclusivity and equity. Through these multifaceted roles, Mutheu Mutuku continues to be a formidable advocate for a more just and equitable world.`,
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/mutheu-mutuku/',
      instagram: 'https://www.instagram.com/mutheucreates/?hl=en',
      email: 'mutheu@equalityvanguard.org'
    }
  },
  {
    id: 'carla',
    name: 'Carla Mujisa',
    title: 'Co-Founder',
    role: 'Co-Founder',
    image: '/images/aCarla.jpg',
    bio: 'Co-founder of Equality Vanguard, bringing strategic vision and leadership to our mission.',
    fullBio: 'Carla Mujisa is a co-founder of Equality Vanguard, bringing strategic vision and leadership to our mission of advancing gender justice and Pan-African feminism. Her dedication to the cause and collaborative approach has been instrumental in shaping our organization\'s direction and impact.',
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/carla-mujisa/',
      instagram: 'https://www.instagram.com/_.mujisa/?hl=en',
      email: 'carla@equalityvanguard.org'
    }
  },
  {
    id: 'nadia',
    name: 'Nadia Achieng\'',
    title: 'Money Matters Strategist',
    role: 'Finance',
    image: '/images/anadia.jpg',
    bio: 'A fervent feminist with financial acumen, leadership and strategic management skills.',
    fullBio: `Nadia Achieng', presently an advocate in training, is a fervent feminist at heart. Her financial acumen, leadership and strategic management skills have continually shone through not only from an entrepreneurial viewpoint having successfully jointly led, pitched and won the premier on-campus Hult Prize Global Accelerator Program at her alma mater, but also through her grant management and compliance experience having continually spearheaded Equality Vanguard's investor relations.

This, coupled with her legal background, continue to spur her to work towards a future that knows and asserts the financial empowerment of every woman in every right; a vocation she continues to zealously pursue through her earnest service as the Money Matters Strategist at Equality Vanguard Africa.`,
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/nadia-achieng-0464631b7/',
      email: 'nadia@equalityvanguard.org'
    }
  },
  {
    id: 'celine',
    name: 'Celine Mumbi',
    title: 'Content and Community Architect',
    role: 'Communications',
    image: '/images/aceline.jpg',
    bio: 'Digital communications specialist and feminist storyteller with over five years of experience.',
    fullBio: `Celine Mumbi is a digital communications specialist, content creator, and feminist storyteller with over five years of experience in digital marketing and communications. At Equality Vanguard, she leads social media, and content strategy, using creativity and storytelling to amplify conversations on gender justice and build meaningful connections with audiences.

Her career spans both the private and non-profit sectors. She began in ecommerce with Jumia Kenya and BaKi Beauty, where she designed and executed digital campaigns that grew online communities, boosted engagement, and drove sales. Today, alongside her work at Equality Vanguard, she also contributes to Collective Threads Initiative, shaping communications that embed care and inclusivity in movement building.

Celine blends strategy with creativity, drawing on her experience as both a communications professional and content creator to craft authentic and relatable narratives. She is currently pursuing a CIM Diploma in Professional Digital Marketing to deepen her expertise in strategic communications and digital engagement.

Passionate about feminist values, Celine uses her work and platforms to amplify women's voices, challenge inequality, and spark conversations that inspire collective action. At Equality Vanguard, she is dedicated to building vibrant communications that center justice, equality, and the power of storytelling.`,
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/celine-mumbi-673b78146/',
      instagram: 'https://www.instagram.com/celine_.mumbi/?hl=en',
      email: 'celine@equalityvanguard.org'
    }
  },
  {
    id: 'melvin',
    name: 'Melvin Bosibori',
    title: 'Policy and Advocacy Weaver',
    role: 'Policy',
    image: '/images/amelvin.jpg',
    bio: 'A lawyer and Advocate in training with expertise in data protection and policy advocacy.',
    fullBio: `Melvin Bosibori brings a dynamic blend of expertise, passion, and purpose to Equality Vanguard. As our Policy Weaver, Melvin ensures that Equality Vanguard operates within the framework of the law but also champions for women's rights ensuring that they can appreciate the different avenues to seek legal redress.

Melvin is passionate about the intersection of law and technology. With her certification in Data Protection, she is constantly exploring how emerging issues around privacy, digital rights and online governance affect people, particularly women. A lawyer and an Advocate in training, Melvin has experience in drafting contracts, providing advisory services, negotiating for clients skills that she uses in her impactful work at Equality Vanguard.

While not drafting contracts, Melvin enjoys watching films and series and dancing.`,
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/melvin-bosibori-720b0b243/',
      instagram: 'https://www.instagram.com/themelvin254/?hl=en',
      email: 'melvin@equalityvanguard.org'
    }
  },
  {
    id: 'purity',
    name: 'Purity Buyanzi',
    title: 'Feminist Justice Scribe',
    role: 'Research',
    image: '/images/abuyanzi.jpg',
    bio: 'Feminist Justice Scribe and Trainee Advocate with expertise in legal writing and research.',
    fullBio: `Purity Buyanzi is the Feminist Justice Scribe at Equality Vanguard and currently a Trainee Advocate at the Kenya School of Law. She brings her expertise in feminist legal writing, research, and editorial work to lead Equality Vanguard's development of feminist research and advocacy content. She also reviews and refines contributions from contributing writers across the movement, ensuring that every publication upholds Equality Vanguard's standards, reflects feminist values, and advances our collective mission.

Her skills span legal research and drafting, advocacy communication, and editorial leadership. With a focus on sexual and reproductive health and rights (SRHR), economic justice, gender justice, and digital rights, she uses the written word to break down complex issues, amplify marginalized voices, and drive forward the advancement of equality and justice.`,
    socialLinks: {
      linkedin: 'https://www.linkedin.com/in/purity-buyanzi-a3b904239/',
      instagram: 'https://www.instagram.com/ms.buyanzi/?hl=en',
      email: 'purity@equalityvanguard.org'
    }
  }
];

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Meet the Team
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            The passionate individuals driving our mission forward
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => setSelectedMember(member)}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative h-96 w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <h3 className="font-fredoka text-xl font-bold text-brand-teal mb-2">
                  {member.name}
                </h3>
                <p className="font-spartan text-brand-orange font-semibold mb-3">
                  {member.title}
                </p>
                <p className="font-spartan text-gray-600 text-sm leading-relaxed">
                  {member.bio}
                </p>
                
                <div className="mt-4">
                  <span className="text-sm font-semibold text-brand-teal group-hover:text-brand-orange transition-colors duration-300">
                    Learn more →
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Member Modal */}
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative h-[500px] w-full">
                <Image
                  src={selectedMember.image}
                  alt={selectedMember.name}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
              
              <div className="p-8">
                <h3 className="font-fredoka text-3xl font-bold text-brand-teal mb-2">
                  {selectedMember.name}
                </h3>
                <p className="font-spartan text-brand-orange font-semibold text-lg mb-6">
                  {selectedMember.title}
                </p>
                
                <div className="prose prose-lg max-w-none">
                  <p className="font-spartan text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedMember.fullBio}
                  </p>
                </div>

                {selectedMember.socialLinks && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-fredoka text-lg font-semibold text-brand-teal mb-4">
                      Connect
                    </h4>
                    <div className="flex space-x-4">
                      {selectedMember.socialLinks.linkedin && (
                        <a
                          href={selectedMember.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center text-white hover:bg-brand-orange transition-colors duration-200"
                        >
                          <span className="text-sm font-bold">in</span>
                        </a>
                      )}
                      {selectedMember.socialLinks.instagram && (
                        <a
                          href={selectedMember.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white hover:bg-brand-teal transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      {selectedMember.socialLinks.email && (
                        <a
                          href={`mailto:${selectedMember.socialLinks.email}`}
                          className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center text-brand-teal hover:bg-brand-brown transition-colors duration-200"
                        >
                          <span className="text-sm font-bold">@</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

