import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const caseStudies = [
  {
    id: 1,
    industry: "Jewelry",
    client: "Luxe Diamonds",
    metric: "312% ROAS",
    result:
      "Scaled from \u20B92L to \u20B915L monthly revenue through Meta Ads",
  },
  {
    id: 2,
    industry: "Real Estate",
    client: "Skyline Properties",
    metric: "2,500+ Leads",
    result:
      "Generated qualified leads at \u20B985 CPL through Google & Meta Ads",
  },
  {
    id: 3,
    industry: "E-commerce",
    client: "TrendyCart",
    metric: "5.2x ROAS",
    result: "Achieved 5.2x return on ad spend with full-funnel strategy",
  },
  {
    id: 4,
    industry: "Retail",
    client: "FashionHub",
    metric: "180% Growth",
    result:
      "Doubled online store revenue in 6 months with omnichannel strategy",
  },
  {
    id: 5,
    industry: "F&B",
    client: "Spice Garden",
    metric: "10K+ Orders",
    result:
      "Built delivery brand from zero to 10K monthly orders via WhatsApp & Ads",
  },
  {
    id: 6,
    industry: "Jewelry",
    client: "Royal Gems",
    metric: "450% ROAS",
    result:
      "Premium jewelry brand scaling with high-ticket Meta & Google campaigns",
  },
  {
    id: 7,
    industry: "Real Estate",
    client: "GreenVista Homes",
    metric: "1,800 Leads",
    result:
      "Pre-launch campaign generating quality leads for luxury apartments",
  },
  {
    id: 8,
    industry: "E-commerce",
    client: "GlowUp Beauty",
    metric: "3.8x ROAS",
    result:
      "D2C beauty brand scaling through influencer + performance marketing",
  },
];

const industries = [
  "All",
  "Jewelry",
  "Real Estate",
  "E-commerce",
  "Retail",
  "F&B",
];

const industryColors = {
  Jewelry: { bg: "bg-amber-500/15", text: "text-amber-400" },
  "Real Estate": { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  "E-commerce": { bg: "bg-violet-500/15", text: "text-violet-400" },
  Retail: { bg: "bg-rose-500/15", text: "text-rose-400" },
  "F&B": { bg: "bg-orange-500/15", text: "text-orange-400" },
};

function CaseStudyCard({ study }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState(
    "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`
    );
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setTransform(
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
    );
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const colors = industryColors[study.industry];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform,
          transition: "transform 0.15s ease-out",
        }}
        className="relative overflow-hidden rounded-2xl border border-[#2A2A3E] bg-[#12121A] p-6 h-full"
      >
        {/* Glare overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
            transition: "opacity 0.15s ease-out",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 h-full">
          {/* Header: logo placeholder + industry tag */}
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white/60">
              {study.client
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
            >
              {study.industry}
            </span>
          </div>

          {/* Client name */}
          <h3 className="text-lg font-semibold text-white">{study.client}</h3>

          {/* Key metric */}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
              {study.metric}
            </span>
          </div>

          {/* Result description */}
          <p className="text-sm leading-relaxed text-gray-400 flex-1">
            {study.result}
          </p>

          {/* Bottom accent line */}
          <div className="h-px w-full bg-gradient-to-r from-[#3B82F6]/40 via-[#60A5FA]/20 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered =
    activeFilter === "All"
      ? caseStudies
      : caseStudies.filter((s) => s.industry === activeFilter);

  return (
    <section className="relative overflow-hidden bg-[#0A0A12] px-4 py-20 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#3B82F6]/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-14 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#3B82F6]"
          >
            Our Portfolio
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
          >
            Results That Speak Louder
          </motion.h2>
        </div>

        {/* Filter buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-3"
        >
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => setActiveFilter(industry)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                activeFilter === industry
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/25"
                  : "border border-[#2A2A3E] text-gray-400 hover:border-[#3B82F6]/50 hover:text-white"
              }`}
            >
              {industry}
            </button>
          ))}
        </motion.div>

        {/* Cards grid */}
        <motion.div
          layout
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
