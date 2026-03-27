import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Testimonial Data                                                    */
/* ------------------------------------------------------------------ */

const testimonials = [
  {
    quote:
      "Growth Arc Media transformed our digital presence completely. Our ROAS went from 1.5x to 4.8x in just 3 months.",
    name: "Rahul Sharma",
    role: "CEO",
    company: "Luxe Diamonds",
    rating: 5,
    color: "from-purple-500 to-indigo-600",
  },
  {
    quote:
      "The team's expertise in real estate marketing is unmatched. They generated over 2,500 qualified leads for our project.",
    name: "Priya Kapoor",
    role: "Marketing Head",
    company: "Skyline Properties",
    rating: 5,
    color: "from-cyan-500 to-blue-600",
  },
  {
    quote:
      "Their AI-powered approach to campaign optimization is next level. We've seen consistent month-over-month growth.",
    name: "Amit Patel",
    role: "Founder",
    company: "TrendyCart",
    rating: 5,
    color: "from-emerald-500 to-teal-600",
  },
  {
    quote:
      "Best decision we made was partnering with Growth Arc Media. Our WhatsApp marketing campaign was a game-changer.",
    name: "Neha Gupta",
    role: "Owner",
    company: "Spice Garden",
    rating: 5,
    color: "from-orange-500 to-red-600",
  },
  {
    quote:
      "Professional, data-driven, and always ahead of the curve. They don't just manage ads, they engineer growth.",
    name: "Vikram Singh",
    role: "Director",
    company: "GreenVista Homes",
    rating: 5,
    color: "from-pink-500 to-rose-600",
  },
  {
    quote:
      "From website redesign to performance marketing, they handled everything beautifully. Truly a one-stop agency.",
    name: "Ananya Reddy",
    role: "Co-founder",
    company: "GlowUp Beauty",
    rating: 5,
    color: "from-violet-500 to-purple-600",
  },
];

/* ------------------------------------------------------------------ */
/*  Helper: Initials from name                                          */
/* ------------------------------------------------------------------ */

function getInitials(name) {
  const parts = name.split(" ");
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Slide Variants                                                      */
/* ------------------------------------------------------------------ */

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

/* ------------------------------------------------------------------ */
/*  Testimonial Card                                                    */
/* ------------------------------------------------------------------ */

function TestimonialCard({ testimonial }) {
  return (
    <div className="relative mx-auto w-full max-w-2xl px-4">
      <div
        className="relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl
                    md:p-10"
      >
        {/* Quote icon */}
        <FaQuoteLeft className="mb-4 text-3xl text-purple-400/40" />

        {/* Quote text */}
        <p className="mb-6 text-lg leading-relaxed text-gray-200 md:text-xl">
          &ldquo;{testimonial.quote}&rdquo;
        </p>

        {/* Star rating */}
        <div className="mb-6 flex gap-1">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <FaStar key={i} className="text-lg text-yellow-400" />
          ))}
        </div>

        {/* Client info */}
        <div className="flex items-center gap-4">
          {/* Avatar with initials */}
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} text-lg font-bold text-white shadow-lg`}
          >
            {getInitials(testimonial.name)}
          </div>

          <div>
            <p className="font-semibold text-white">{testimonial.name}</p>
            <p className="text-sm text-gray-400">
              {testimonial.role}, {testimonial.company}
            </p>
          </div>
        </div>

        {/* Decorative glow */}
        <div className="pointer-events-none absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 blur-sm" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Testimonials Section                                                */
/* ------------------------------------------------------------------ */

export default function Testimonials() {
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection) => {
      setActiveIndex(([prev]) => {
        const next =
          (prev + newDirection + testimonials.length) % testimonials.length;
        return [next, newDirection];
      });
    },
    []
  );

  const goTo = useCallback((index) => {
    setActiveIndex(([prev]) => [index, index > prev ? 1 : -1]);
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000);
    return () => clearInterval(timer);
  }, [paginate]);

  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 md:py-32">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-cyan-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What Our Clients Say
          </h2>
          <p className="text-lg text-gray-400">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-semibold text-transparent">
              150+ Brands
            </span>{" "}
            Worldwide
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Slide area */}
          <div className="relative min-h-[320px] md:min-h-[280px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 flex items-center"
              >
                <TestimonialCard testimonial={testimonials[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => paginate(-1)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10
                       bg-white/5 p-3 text-white backdrop-blur-sm transition hover:bg-white/10
                       md:-left-4 lg:-left-8"
          >
            <FaChevronLeft className="text-lg" />
          </button>

          <button
            onClick={() => paginate(1)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/10
                       bg-white/5 p-3 text-white backdrop-blur-sm transition hover:bg-white/10
                       md:-right-4 lg:-right-8"
          >
            <FaChevronRight className="text-lg" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="mt-10 flex justify-center gap-2.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-8 bg-gradient-to-r from-purple-500 to-cyan-500"
                  : "w-2.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
