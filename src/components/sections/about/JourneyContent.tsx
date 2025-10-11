'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function JourneyContent() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-fredoka text-5xl font-bold text-brand-teal mb-6">
            The Journey
          </h1>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mb-8"></div>
        </motion.div>

        {/* Cover Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl mb-16"
        >
          <Image
            src="/images/place1 (19).jpg"
            alt="The Journey - Equality Vanguard"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
        </motion.div>

        {/* Journey Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-lg max-w-none"
        >
          <div className="space-y-8">
            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              The ordinary meaning of the word Equality connotes fairness, parity, and the absence of discrimination. Vanguard, in its plain and legal sense, refers to those positioned at the forefront of a movement, pioneers who assume the duty of ushering in change.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              Combined, Equality Vanguard embodies a conscious declaration: to stand at the frontlines of justice, to articulate the silenced, and to advance the cause of substantive equality.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              The origins of Equality Vanguard are traceable to the precincts of law school, where four of its founding members underwent four years of rigorous legal training. Within those corridors of jurisprudence, it became manifest that the letter of the law, however noble, was often at variance with lived realities. While feminist legal theory provided intellectual grounding, its application revealed systemic deficiencies.
            </p>

            <div className="bg-gradient-to-r from-brand-yellow/10 to-brand-orange/10 p-8 rounded-2xl my-12">
              <p className="font-fredoka text-2xl font-bold text-brand-teal text-center">
                Why did the law appear progressive on paper, yet oppressive in practice?
              </p>
            </div>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              Why were certain voices, particularly those of women, gender minorities, and other marginalized persons, systematically excluded from discourses that directly implicated their rights?
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              These inquiries crystallized into collective resolve. What began as scholarly interrogation in classrooms metamorphosed into a movement. Equality Vanguard was thus conceived as a community committed to bridging the gap between principle and praxis, between law and lived experience.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              The transition from theory to praxis was marked by the establishment of ALKAH Book Club- Feminist Literature Book Club. The name itself invokes alchemy: the ancient science of transformation. Just as alchemists sought to transmute base metals into gold, ALKAH exists as a crucible where silence is transmuted into voice, where erasure gives way to remembrance, and where knowledge is refined into collective power.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              Through ALKAH, the words of Audre Lorde, Ama Ata Aidoo, Dr. Sylvia Tamale, and other Pan-African foremothers become both catalyst and compass. Their works do not merely inform; they ignite. Within these sessions, members become co-alchemists, undertaking the slow burn of consciousness-raising.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              The Legal Vanguard is our newest program, yet it is also a homecoming and a deliberate return to the roots from which Equality Vanguard first drew breath. The belief that law, though imperfect, may be wielded as a tool of transformation. It is a gathering place for legal minds who choose to read the law as living instrument, capable of remedy as much as harm. Here, statutes and precedents are interrogated through feminist, decolonial, and climate justice lenses; here, knowledge is exchanged on land rights, extractives, registration processes, academic writing, and the provision of legal aid as the need may arise. A network of lawyers and jurists intend on decolonizing legal thought, unsettling the inherited silences of jurisprudence, and shaping policy that reflects the realities of those it purports to govern. The Legal Vanguard is, in essence, the reclamation of law as voice, as shield, as remedy.
            </p>

            <div className="bg-gradient-to-r from-brand-teal/10 to-brand-brown/10 p-8 rounded-2xl my-12">
              <p className="font-fredoka text-xl font-bold text-brand-teal text-center italic">
                "Your silence will not protect you." - Audre Lorde
              </p>
            </div>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              Audre Lorde taught us that "your silence will not protect you." Justice cannot be postponed to another season, nor left in the hands of those who profit from silence. It must be spoken, sought, and practised even when it is unfinished, even when it feels impossible.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              Equality Vanguard was born of this recognition. Questions raised in law school, alchemy of ALKAH where Pan-African foremothers guide our steps, and now the Legal Vanguard, where law is reimagined as remedy.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              We invite you to join us in this pursuit. To be part of the Vanguard is to read, to question, to advocate, to create. It is to add your voice where silence has been imposed, to lend your hand where the arc of justice demands bending. The journey is not complete, and the chorus is not yet full.
            </p>

            <p className="font-spartan text-lg text-gray-700 leading-relaxed">
              The revolution we labour for is not a fleeting season's harvest but the slow, deliberate planting of seeds in soil long denied its rain. We who stand in the Vanguard know that the fruits may ripen beyond our lifetime, that the statutes we challenge and the policies we bend toward justice may only reveal their fullness to generations unborn. Yet still, we till, we water, we write, we litigate, because the measure of our calling is not in immediacy but in fidelity to the struggle. To be a seeker of justice is to walk knowing the dawn may break for others, and to embrace that truth as both burden and gift.
            </p>
          </div>
        </motion.div>

        {/* Back to About */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            href="/about"
            className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Back to About
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

