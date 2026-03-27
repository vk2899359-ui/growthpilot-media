import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FaFacebookF,
  FaGoogle,
  FaInstagram,
  FaCode,
  FaRocket,
  FaSearch,
  FaWhatsapp,
  FaRobot,
  FaVideo,
} from 'react-icons/fa';

const servicesData = [
  {
    title: 'Meta Ads Management',
    icon: FaFacebookF,
    description:
      'Strategic Facebook & Instagram advertising with AI-powered audience targeting and creative optimization.',
  },
  {
    title: 'Google Ads & PPC',
    icon: FaGoogle,
    description:
      'Data-driven Google Ads campaigns delivering maximum ROI through precision targeting and bid optimization.',
  },
  {
    title: 'Social Media Management',
    icon: FaInstagram,
    description:
      'End-to-end social media management with engaging content creation and community building.',
  },
  {
    title: 'Website Design & Development',
    icon: FaCode,
    description:
      'Stunning, conversion-focused websites with 3D elements, animations, and blazing-fast performance.',
  },
  {
    title: 'Landing Page Design & CRO',
    icon: FaRocket,
    description:
      'High-converting landing pages with A/B testing and continuous conversion rate optimization.',
  },
  {
    title: 'SEO & Local SEO',
    icon: FaSearch,
    description:
      'Dominate search rankings with comprehensive SEO strategies and local search optimization.',
  },
  {
    title: 'WhatsApp Marketing',
    icon: FaWhatsapp,
    description:
      'Automated WhatsApp campaigns for lead nurturing, customer engagement, and instant support.',
  },
  {
    title: 'AI-Powered Marketing',
    icon: FaRobot,
    description:
      'Leverage artificial intelligence for predictive analytics, automated campaigns, and smart optimization.',
  },
  {
    title: 'Video Marketing & Reels',
    icon: FaVideo,
    description:
      'Scroll-stopping video content and viral reels production for maximum brand engagement.',
  },
];

function ServiceCard({ service, index }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const Icon = service.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="perspective-[1000px] h-[320px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 rounded-2xl bg-[#12121A] border border-[#2A2A3E] p-8 flex flex-col items-center justify-center gap-6 backdrop-blur-md transition-all duration-300 hover:border-[#00D4FF] hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#00D4FF]/20 to-[#FFD700]/10 flex items-center justify-center">
            <Icon className="text-3xl text-[#00D4FF]" />
          </div>
          <h3 className="text-xl font-bold text-white text-center leading-tight">
            {service.title}
          </h3>
          <div className="w-12 h-0.5 bg-gradient-to-r from-[#00D4FF] to-[#FFD700] rounded-full" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 rounded-2xl bg-[#12121A] border border-[#00D4FF] p-8 flex flex-col items-center justify-center gap-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,212,255,0.15)]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-gray-300 text-center text-sm leading-relaxed">
            {service.description}
          </p>
          <button className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#FFD700] text-[#0A0A12] font-semibold text-sm hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-shadow duration-300">
            Learn More
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Services() {
  const { ref: titleRef, inView: titleInView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section id="services" className="relative py-24 px-4 bg-[#0A0A12] overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 40 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Comprehensive Digital Marketing Solutions
          </p>
          <div className="mt-6 w-24 h-1 bg-gradient-to-r from-[#00D4FF] to-[#FFD700] mx-auto rounded-full" />
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
