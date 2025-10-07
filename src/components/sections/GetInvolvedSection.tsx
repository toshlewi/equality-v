'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function GetInvolvedSection() {
  const actions = [
    {
      title: 'Become a Member',
      description: 'Join our community and support our mission',
      href: '/get-involved',
      icon: '👥',
      color: 'from-brand-yellow to-brand-orange'
    },
    {
      title: 'Partner with Us',
      description: 'Collaborate on advancing gender justice',
      href: '/get-involved',
      icon: '🤝',
      color: 'from-brand-orange to-brand-yellow'
    },
    {
      title: 'Donate',
      description: 'Support our work financially',
      href: '/get-involved',
      icon: '💝',
      color: 'from-brand-teal to-brand-brown'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-fredoka text-4xl font-bold text-brand-teal mb-4">
            Get Involved
          </h2>
          <p className="font-spartan text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in advancing gender justice through transformative, Pan-African feminist action. Together, we can create sustainable impact across communities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="group"
            >
              <Link href={action.href}>
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-brand-yellow group-hover:bg-gradient-to-br group-hover:from-brand-yellow/5 group-hover:to-brand-orange/5">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  
                  <h3 className="font-fredoka text-2xl font-bold text-brand-teal mb-4 text-center group-hover:text-brand-orange transition-colors duration-300">
                    {action.title}
                  </h3>
                  
                  <p className="font-spartan text-gray-600 text-center mb-6 leading-relaxed">
                    {action.description}
                  </p>
                  
                  <div className="text-center">
                    <span className="inline-flex items-center text-brand-orange font-semibold group-hover:text-brand-teal transition-colors duration-300">
                      Learn More
                      <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-brand-teal to-brand-brown rounded-2xl p-8 text-white">
            <h3 className="font-fredoka text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="font-spartan text-lg mb-8 max-w-2xl mx-auto">
              Every action counts. Whether you're joining as a member, partnering with us, or supporting our work, you're contributing to a more just and equitable world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/get-involved"
                className="btn-primary text-lg px-8 py-4 hover:bg-brand-orange hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Join the Movement
              </Link>
              <Link 
                href="/about"
                className="btn-secondary text-lg px-8 py-4 hover:bg-brand-yellow hover:text-brand-teal transition-all duration-300 transform hover:scale-105"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
