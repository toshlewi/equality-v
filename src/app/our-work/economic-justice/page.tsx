'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import WorkPageLayout from '@/components/layout/WorkPageLayout';
import { Button } from '@/components/ui/button';

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

export default function EconomicJusticePage() {
  return (
    <WorkPageLayout
      title="Economic Justice"
      subtitle="Challenging neoliberal frameworks and advocating for feminist economic alternatives"
      heroImage="/images/team7.JPEG"
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
          <h2 className="text-3xl font-bold text-brand-teal mb-6">Our Economic Justice Work</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Equality Vanguard, we assert the intrinsic link between economic justice and gender justice. Throughout Africa and the Global South, the prevailing neoliberal framework, characterized by privatization, austerity measures, and deregulation, has fundamentally restructured not merely markets, but also societal existence.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Feminist scholars delineate this system as a manifestation of gender-based violence, given its structural and enduring detrimental impact, often imperceptible to its beneficiaries. This framework erodes public services, attenuates labor protections, and commodifies essential life elements, compelling women to bear the brunt through unremunerated care work, precarious employment, and personal sacrifice.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Empirical data substantiates this grim reality. During structural adjustment programs in sub-Saharan Africa, average real wages declined in 26 of 28 observed nations. In Ghana, the privatization of forty-two significant state enterprises between 1984 and 1991 resulted in the termination of over 150,000 jobs, disproportionately affecting women in educational, nursing, and clerical professions. In South Africa, more than 60% of households in Soweto experienced electricity disconnections within a single year, with some enduring outages for over a month. Across rural Kenya, climate shocks, exacerbated by resource privatization, compel households to confront untenable choices: 42% of out-of-school girls cite domestic responsibilities, such as childcare or water collection, as the reason for their withdrawal after their families&apos; incomes collapsed.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Privatization and structural adjustment programs transfer risk from governmental entities to individuals. Hospitals, educational institutions, and utilities, formerly regarded as public trusts, are re-envisioned as cost centers or profit-generating opportunities. User fees for healthcare services render care inaccessible to the impoverished. Water and electricity tariffs escalate under private operators, forcing families to prioritize between essential services and sustenance. As public safety nets disintegrate, women compensate for these deficiencies, engaging in extended unremunerated labor, incurring debt, or entering insecure informal employment. This unseen labor sustains households and communities but degrades women&apos;s health, economic autonomy, and prospects for education or leadership.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            The environmental ramifications are equally profound. Resource privatization and cost-recovery policies frequently diminish oversight and accountability, leading to environmental degradation that disproportionately harms smallholder farmers, predominantly women. When forests are cleared for extractive industries or land is commodified for large-scale agribusiness, women lose access to firewood, water, and arable land. Climate shocks, droughts, floods, unpredictable seasons, intensify under these conditions, exacerbating poverty and instigating practices such as early marriage or school withdrawal for girls. Privatized utilities respond to climate-induced disruptions by raising prices or curtailing supply, further marginalizing those already at the periphery.
          </p>
        </motion.section>

        {/* The Problem */}
        <motion.section variants={fadeInUp} className="bg-red-50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-red-800 mb-6">The Hidden Violence of Neoliberalism</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-red-700 mb-4">Structural Impact</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>During structural adjustment programs in sub-Saharan Africa, average real wages declined in 26 of 28 observed nations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>In Ghana, privatization of 42 state enterprises resulted in termination of over 150,000 jobs, disproportionately affecting women</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>In South Africa, 60% of households experienced electricity disconnections within a single year</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-red-700 mb-4">Environmental Impact</h4>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Resource privatization leads to environmental degradation that disproportionately harms women farmers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>Climate shocks intensify under privatization, exacerbating poverty and forcing difficult choices</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span>42% of out-of-school girls cite domestic responsibilities after family income collapse</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Our Approach */}
        <motion.section variants={fadeInUp} className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-brand-teal mb-6">Our Feminist Economic Approach</h3>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Gender-Responsive Budgeting</h4>
                <p className="text-gray-700">Advocating for budget allocation that considers the differential impact of economic policies on women and men.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Recognition of Care Work</h4>
                <p className="text-gray-700">Working to ensure unremunerated care work is recognized as integral to the economy and properly valued.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-semibold text-brand-teal mb-3">Feminist Alternatives</h4>
                <p className="text-gray-700">Promoting cooperatives, care-centered economies, and progressive redistribution models.</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
            <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
            <p className="text-lg leading-relaxed mb-6">
              An economy that gauges success by human well-being and planetary health, rather than by abstract growth figures or profit margins. Economic justice is the right to live with dignity, to offer and receive care, and to participate in shaping the principles of our collective future.
            </p>
            <Link href="/about">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white"
              >
                Learn More About Our Work
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* Key Statistics */}
        <motion.section variants={fadeInUp} className="bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-8 text-center">The Numbers Don&apos;t Lie</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-orange mb-2">26/28</div>
              <div className="text-gray-700">Nations in sub-Saharan Africa where real wages declined during structural adjustment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-orange mb-2">150K+</div>
              <div className="text-gray-700">Jobs lost in Ghana&apos;s privatization, disproportionately affecting women</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-orange mb-2">60%</div>
              <div className="text-gray-700">Of Soweto households experienced electricity disconnections in one year</div>
            </div>
          </div>
        </motion.section>

        {/* Our Solutions */}
        <motion.section variants={fadeInUp} className="bg-gradient-to-r from-brand-teal to-blue-600 rounded-2xl p-12 text-white">
          <div className="max-w-4xl">
            <h3 className="text-3xl font-bold mb-6">Building Feminist Economic Alternatives</h3>
            <p className="text-xl leading-relaxed mb-8">
              Equality Vanguard addresses these challenges by integrating rigorous legal approaches with innovative alternatives. We advocate for gender-responsive budgeting, equitable taxation, robust social protection, and the recognition of unremunerated care work as integral to the economy. We meticulously document the lived experiences of women navigating these policies, utilizing testimonies and research to unveil the insidious violence inherent in economic systems. We forge alliances with feminist economists, labor unions, climate justice movements, and community organizations to devise solutions that prioritize care, equity, and ecological sustainability.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              Our vision is unambiguous: an economy that gauges success by human well-being and planetary health, rather than by abstract growth figures or profit margins. Economic justice is the right to live with dignity, to offer and receive care, and to participate in shaping the principles of our collective future.
            </p>
            <p className="text-lg leading-relaxed mb-8">
              Designating neoliberalism as a form of gender-based violence is a necessary act of truth-telling. By contesting privatization and deleterious economic reforms, and by championing feminist economic alternatives, such as cooperatives, care-centered economies, and progressive redistribution, we endeavor to construct an economy that heals rather than inflicts harm.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-3">Documentation & Research</h4>
                <p className="text-white/90">We meticulously document the lived experiences of women navigating these policies, utilizing testimonies and research to unveil the insidious violence inherent in economic systems.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <h4 className="text-xl font-semibold mb-3">Policy Advocacy</h4>
                <p className="text-white/90">We advocate for gender-responsive budgeting, equitable taxation, robust social protection, and the recognition of unremunerated care work as integral to the economy.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center bg-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-brand-teal mb-6">Join Our Economic Justice Movement</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Designating neoliberalism as a form of gender-based violence is a necessary act of truth-telling. By contesting privatization and deleterious economic reforms, we endeavor to construct an economy that heals rather than inflicts harm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-involved">
              <Button 
                size="lg" 
                className="bg-brand-yellow text-brand-teal hover:bg-brand-orange hover:text-white px-8 py-4 text-lg"
              >
                Get Involved
              </Button>
            </Link>
          </div>
        </motion.section>
      </motion.div>
    </WorkPageLayout>
  );
}
