import { motion } from "framer-motion";
import { useState } from "react";

const thumbnails = [
  { id: 1, title: "Meta Ads Case Study - Luxe Diamonds" },
  { id: 2, title: "Google Ads Strategy Breakdown" },
  { id: 3, title: "Social Media Content Reel" },
  { id: 4, title: "Website Design Showreel" },
  { id: 5, title: "Client Success Stories" },
  { id: 6, title: "Behind The Scenes" },
];

function PlayIcon({ size = 64 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)",
      }}
    >
      <div
        className="ml-1"
        style={{
          width: 0,
          height: 0,
          borderTop: `${size * 0.22}px solid transparent`,
          borderBottom: `${size * 0.22}px solid transparent`,
          borderLeft: `${size * 0.35}px solid #0A0A0F`,
        }}
      />
    </div>
  );
}

function Particle({ index }) {
  const size = Math.random() * 3 + 1;
  const left = `${(index * 17.3) % 100}%`;
  const top = `${(index * 23.7) % 100}%`;
  const delay = (index * 0.4) % 5;
  const duration = 3 + (index % 4);

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left,
        top,
        background: index % 3 === 0 ? "#00D4FF" : index % 3 === 1 ? "#FFD700" : "#ffffff",
        opacity: 0.15 + (index % 5) * 0.05,
        animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite alternate`,
      }}
    />
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function VideoShowreel() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0A0F]">
      {/* CSS animation keyframes */}
      <style>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { opacity: 0.35; }
          100% { transform: translateY(-30px) translateX(15px); opacity: 0.1; }
        }
      `}</style>

      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Radial glow accents */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span
            className="inline-block text-sm font-semibold tracking-[0.2em] uppercase mb-4"
            style={{
              background: "linear-gradient(90deg, #00D4FF, #FFD700)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Creative That Converts
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            See Our Work{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #00D4FF, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              In Action
            </span>
          </h2>
        </motion.div>

        {/* Main Video Placeholder */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div
            className="group relative rounded-2xl p-[2px] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #00D4FF, #FFD700)",
            }}
          >
            <div className="relative w-full rounded-2xl bg-[#0A0A0F] overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* Dark gradient interior */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#12121A] via-[#0A0A0F] to-[#12121A]" />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <PlayIcon size={80} />
                <span className="text-white/70 text-lg md:text-xl font-medium tracking-wide">
                  Watch Our Showreel
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Thumbnail Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {thumbnails.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-[#12121A] hover:ring-1 hover:ring-[#00D4FF]/30 transition-all duration-300"
              onClick={() => setActiveVideo(video.id)}
            >
              <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                {/* Dark placeholder bg */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a25] to-[#12121A]" />

                {/* Subtle shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Play icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayIcon size={44} />
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                  <p className="text-white text-sm font-medium leading-snug">{video.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
