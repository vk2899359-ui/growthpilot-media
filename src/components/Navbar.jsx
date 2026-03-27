import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Portfolio", href: "#portfolio" },
  { name: "Industries", href: "#industries" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0f]/90 shadow-lg shadow-black/20"
            : "bg-[#0a0a0f]/50"
        } backdrop-blur-xl border-b border-white/[0.06]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <span
                className="text-xl sm:text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="bg-gradient-to-r from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
                  Growth Arc
                </span>{" "}
                <span className="text-white/90">Media</span>
              </span>
            </a>

            {/* Desktop Nav Links */}
            <div
              className="hidden lg:flex items-center gap-1"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm text-white/70 hover:text-white transition-colors duration-200 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/40 group-hover:w-3/4 transition-all duration-300 rounded-full" />
                </a>
              ))}
            </div>

            {/* Desktop CTA + Mobile Hamburger */}
            <div className="flex items-center gap-4">
              {/* CTA Button */}
              <a
                href="#contact"
                className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0a0a0f] bg-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/90 transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Get Free Audit
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 flex flex-col gap-[5px]">
                  <motion.span
                    animate={
                      mobileOpen
                        ? { rotate: 45, y: 7 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.25 }}
                    className="block h-[2px] w-full bg-current rounded-full origin-center"
                  />
                  <motion.span
                    animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="block h-[2px] w-full bg-current rounded-full"
                  />
                  <motion.span
                    animate={
                      mobileOpen
                        ? { rotate: -45, y: -7 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.25 }}
                    className="block h-[2px] w-full bg-current rounded-full origin-center"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[280px] bg-[#0d0d14]/95 backdrop-blur-2xl border-l border-white/[0.06] lg:hidden"
            >
              <div className="flex flex-col h-full pt-20 pb-8 px-6">
                {/* Close button */}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-5 right-4 w-10 h-10 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Mobile Links */}
                <nav
                  className="flex flex-col gap-1"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {navLinks.map((link, i) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className="px-4 py-3 text-[15px] text-white/70 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors duration-200"
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                  className="mt-8 px-4"
                >
                  <a
                    href="#contact"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-semibold text-[#0a0a0f] bg-[#00D4FF] rounded-lg hover:bg-[#00D4FF]/90 transition-all duration-200 shadow-[0_0_20px_rgba(0,212,255,0.35)]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Get Free Audit
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </a>
                </motion.div>

                {/* Bottom branding */}
                <div className="mt-auto pt-6 border-t border-white/[0.06] px-4">
                  <p
                    className="text-xs text-white/30"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span className="bg-gradient-to-r from-[#00D4FF] to-[#FFD700] bg-clip-text text-transparent">
                      Growth Arc Media
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
