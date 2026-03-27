import React from 'react';
import { motion } from 'framer-motion';
import {
  FaGem,
  FaBuilding,
  FaShoppingCart,
  FaTshirt,
  FaUtensils,
  FaLaptopCode,
  FaHeartbeat,
} from 'react-icons/fa';

const industriesData = [
  {
    title: 'Jewelry & Luxury Brands',
    icon: FaGem,
    description:
      'Premium positioning and high-ticket customer acquisition for luxury brands.',
  },
  {
    title: 'Real Estate & PropTech',
    icon: FaBuilding,
    description:
      'Lead generation and brand building for developers and real estate firms.',
  },
  {
    title: 'E-commerce & D2C',
    icon: FaShoppingCart,
    description:
      'Full-funnel growth strategies for online stores and D2C brands.',
  },
  {
    title: 'Retail & Fashion',
    icon: FaTshirt,
    description:
      'Omnichannel marketing strategies for retail and fashion brands.',
  },
  {
    title: 'Food & Hospitality',
    icon: FaUtensils,
    description:
      'Restaurant marketing, delivery brand building, and food tech growth.',
  },
  {
    title: 'SaaS & Technology',
    icon: FaLaptopCode,
    description:
      'Product-led growth, SaaS marketing, and tech startup scaling.',
  },
  {
    title: 'Health & Wellness',
    icon: FaHeartbeat,
    description:
      'Patient acquisition and brand growth for healthcare and wellness brands.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const iconPulse = {
  animate: {
    scale: [1, 1.15, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const Industries = () => {
  return (
    <section id="industries" className="relative py-24 bg-[#0A0A12] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D4FF]/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Industries{' '}
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
              We Serve
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Specialized Expertise Across Sectors
          </p>
        </motion.div>

        {/* Industry Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {industriesData.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{
                  scale: 1.04,
                  transition: { duration: 0.25 },
                }}
                className="group bg-[#12121A] rounded-2xl border border-[#2A2A3E] p-8 cursor-pointer
                  transition-shadow duration-300
                  hover:border-[#00D4FF]/50
                  hover:shadow-[0_0_25px_rgba(0,212,255,0.15)]"
              >
                {/* Icon with glow circle */}
                <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                  {/* Glow background circle */}
                  <div className="absolute inset-0 rounded-full bg-[#00D4FF]/10 group-hover:bg-[#00D4FF]/20 transition-colors duration-300" />
                  <motion.div {...iconPulse}>
                    <Icon className="relative z-10 text-4xl text-[#00D4FF]" />
                  </motion.div>
                </div>

                {/* Industry Name */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#00D4FF] transition-colors duration-300">
                  {industry.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed">
                  {industry.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Industries;
