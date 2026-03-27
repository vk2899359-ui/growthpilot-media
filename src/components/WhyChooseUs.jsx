import React from "react";
import { motion } from "framer-motion";
import {
  FaBrain,
  FaUserTie,
  FaChartLine,
  FaHandshake,
  FaTrophy,
  FaHeadset,
} from "react-icons/fa";

const features = [
  {
    icon: FaBrain,
    title: "AI-Powered Campaign Optimization",
    description:
      "Our proprietary AI algorithms optimize your campaigns 24/7 for maximum performance and ROI.",
    accent: "blue",
  },
  {
    icon: FaUserTie,
    title: "Dedicated Account Manager",
    description:
      "A single point of contact who understands your business inside out and drives results.",
    accent: "gold",
  },
  {
    icon: FaChartLine,
    title: "Transparent Weekly Reporting",
    description:
      "Crystal-clear weekly reports with actionable insights. No vanity metrics, only real data.",
    accent: "blue",
  },
  {
    icon: FaHandshake,
    title: "No Lock-in Contracts",
    description:
      "We earn your trust through results, not contracts. Stay because you want to, not because you have to.",
    accent: "gold",
  },
  {
    icon: FaTrophy,
    title: "Proven ROI Track Record",
    description:
      "Consistent track record of delivering 3-5x ROAS across 150+ brands in multiple industries.",
    accent: "blue",
  },
  {
    icon: FaHeadset,
    title: "24/7 WhatsApp Support",
    description:
      "Round-the-clock support via WhatsApp. Quick responses, real solutions, always available.",
    accent: "gold",
  },
];

const accentStyles = {
  blue: {
    border: "border-t-[#00A3FF]",
    iconBg: "bg-[#00A3FF]/10",
    iconText: "text-[#00A3FF]",
    glow: "group-hover:shadow-[0_0_30px_rgba(0,163,255,0.15)]",
  },
  gold: {
    border: "border-t-[#FFB800]",
    iconBg: "bg-[#FFB800]/10",
    iconText: "text-[#FFB800]",
    glow: "group-hover:shadow-[0_0_30px_rgba(255,184,0,0.15)]",
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const WhyChooseUs = () => {
  return (
    <section className="relative bg-[#0A0A12] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00A3FF]/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#00A3FF] mb-3">
            What Sets Us Apart
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#00A3FF] to-[#FFB800] bg-clip-text text-transparent">
              Us
            </span>
          </h2>
          <div className="mt-4 mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-[#00A3FF] to-[#FFB800]" />
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const style = accentStyles[feature.accent];
            const Icon = feature.icon;

            return (
              <motion.div
                key={index}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className={`group relative bg-[#12121A] rounded-2xl border border-[#2A2A3E] border-t-2 ${style.border} p-8 transition-all duration-300 hover:-translate-y-1 ${style.glow}`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${style.iconBg} ${style.iconText} mb-6 transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#9CA3AF] leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
