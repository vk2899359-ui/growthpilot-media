import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------------------------------------------------------ */
/*  AnimatedCounter                                                    */
/*  Counts from 0 to `end` over ~2 seconds using requestAnimationFrame */
/* ------------------------------------------------------------------ */
function AnimatedCounter({ end, prefix = "", suffix = "", inView }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000; // ms
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // ease-out quad for a smooth deceleration
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.floor(eased * end));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(end);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, end]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats data                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { end: 150, suffix: "+", label: "Clients Served" },
  { end: 50, prefix: "\u20B9", suffix: "M+", label: "Ad Spend Managed" },
  { end: 500, suffix: "+", label: "Landing Pages Designed" },
  { end: 15000, suffix: "+", label: "Leads Generated Monthly" },
];

/* ------------------------------------------------------------------ */
/*  Approach badges                                                    */
/* ------------------------------------------------------------------ */
const badges = ["Data-Driven", "AI-Powered", "ROI-Focused"];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: "easeOut" },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  About component                                                    */
/* ------------------------------------------------------------------ */
export default function About() {
  // Intersection observer for the stats counter
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Intersection observer for the whole section entrance animation
  const { ref: sectionRef, inView: sectionInView } = useInView({
    triggerOnce: true,
    threshold: 0.15,
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0a0a0f] py-24 lg:py-32"
    >
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#00D4FF]/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* ---- Split layout ---- */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT — Text content */}
          <motion.div
            initial="hidden"
            animate={sectionInView ? "visible" : "hidden"}
            variants={fadeUp}
          >
            {/* Title */}
            <motion.h2
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
              variants={fadeUp}
              custom={0}
            >
              About{" "}
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
                Growth Arc Media
              </span>
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="mt-4 text-lg font-semibold text-[#FFD700]"
              variants={fadeUp}
              custom={1}
            >
              9+ Years of Digital Marketing Excellence
            </motion.p>

            {/* Description */}
            <motion.p
              className="mt-6 text-base leading-relaxed text-gray-400 sm:text-lg"
              variants={fadeUp}
              custom={2}
            >
              Growth Arc Media is a performance-first digital marketing agency
              built on three core pillars:{" "}
              <span className="text-white">data-driven strategy</span>,{" "}
              <span className="text-white">AI-powered optimization</span>, and
              an unwavering commitment to{" "}
              <span className="text-white">measurable ROI</span>. Over the past
              nine years we have helped startups, D2C brands, and enterprises
              scale profitably through paid media, conversion-rate optimization,
              and full-funnel growth systems that consistently outperform
              industry benchmarks.
            </motion.p>

            {/* Approach badges */}
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              variants={fadeUp}
              custom={3}
            >
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 px-5 py-2 text-sm font-medium text-[#00D4FF] backdrop-blur"
                >
                  {badge}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — Team photo placeholder */}
          <motion.div
            initial="hidden"
            animate={sectionInView ? "visible" : "hidden"}
            variants={scaleIn}
            className="flex items-center justify-center"
          >
            <div className="flex aspect-[4/3] w-full max-w-lg items-center justify-center rounded-2xl border border-white/10 bg-gray-800/60 shadow-lg shadow-[#00D4FF]/5 backdrop-blur">
              <span className="text-lg font-medium text-gray-500">
                Team Photo
              </span>
            </div>
          </motion.div>
        </div>

        {/* ---- Stats grid ---- */}
        <div
          ref={statsRef}
          className="mt-20 grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
              variants={fadeUp}
              custom={i}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur transition-colors hover:border-[#00D4FF]/40"
            >
              <p className="text-3xl font-extrabold text-[#00D4FF] sm:text-4xl lg:text-5xl">
                <AnimatedCounter
                  end={stat.end}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  inView={statsInView}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-gray-400 sm:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
