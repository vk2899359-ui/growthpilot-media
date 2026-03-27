import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaInstagram,
  FaLinkedinIn,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";

/* ------------------------------------------------------------------ */
/*  Contact info card data                                             */
/* ------------------------------------------------------------------ */
const contactCards = [
  {
    icon: FaWhatsapp,
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    href: "https://wa.me/919800000000",
    borderColor: "border-green-500",
    iconColor: "text-green-500",
    isWhatsApp: true,
  },
  {
    icon: FaEnvelope,
    label: "Email",
    value: "hello@growtharcmedia.com",
    href: "mailto:hello@growtharcmedia.com",
    borderColor: "border-[#00D4FF]",
    iconColor: "text-[#00D4FF]",
  },
  {
    icon: FaPhone,
    label: "Phone",
    value: "+91 98XX XXX XXX",
    href: "tel:+9198XXXXXXXX",
    borderColor: "border-[#FFD700]",
    iconColor: "text-[#FFD700]",
  },
  {
    icon: FaMapMarkerAlt,
    label: "Office",
    value: "Gurugram, Haryana, India",
    href: null,
    borderColor: "border-purple-500",
    iconColor: "text-purple-500",
  },
];

const socialLinks = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  ContactCard                                                        */
/* ------------------------------------------------------------------ */
function ContactCard({ card }) {
  const Icon = card.icon;

  const inner = (
    <div className="flex items-center gap-4">
      {/* Icon circle */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A2E] border-2 ${card.borderColor}`}
      >
        <Icon className={`text-xl ${card.iconColor}`} />
      </div>

      {/* Text */}
      <div>
        <p className="text-sm text-gray-400">{card.label}</p>
        {card.isWhatsApp ? (
          <span className="inline-block mt-1 px-5 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition">
            {card.value}
          </span>
        ) : (
          <p className="text-white font-medium">{card.value}</p>
        )}
      </div>
    </div>
  );

  return card.href ? (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#00D4FF]/40 transition-all duration-300"
    >
      {inner}
    </a>
  ) : (
    <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      {inner}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact Section                                                    */
/* ------------------------------------------------------------------ */
export default function Contact() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-24 md:py-32 bg-[#0A0A0F] overflow-hidden"
    >
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* ---- Heading ---- */}
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Get In{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#FFD700]">
              Touch
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Let&apos;s Build Something Great Together
          </p>
        </motion.div>

        {/* ---- Two-column layout ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Contact cards + socials */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-5"
          >
            {contactCards.map((card) => (
              <motion.div key={card.label} variants={fadeUp}>
                <ContactCard card={card} />
              </motion.div>
            ))}

            {/* Social links */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-4 pt-4"
            >
              {socialLinks.map((s) => {
                const SIcon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex items-center justify-center w-11 h-11 rounded-full bg-[#1A1A2E] text-gray-300 hover:bg-[#00D4FF] hover:text-white transition-all duration-300"
                  >
                    <SIcon className="text-lg" />
                  </a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right: Google Maps placeholder */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="w-full h-80 lg:h-full min-h-[360px] rounded-2xl bg-[#1A1A2E] border border-white/10 flex flex-col items-center justify-center gap-3"
          >
            <FaMapMarkerAlt className="text-4xl text-[#00D4FF]" />
            <span className="text-gray-400 text-lg font-medium">
              Google Maps
            </span>
            <span className="text-gray-500 text-sm">
              Gurugram, Haryana, India
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
