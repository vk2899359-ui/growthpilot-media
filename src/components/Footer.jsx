import { FaInstagram, FaLinkedinIn, FaFacebookF, FaYoutube } from "react-icons/fa";

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#" },
  { label: "Services", href: "#" },
  { label: "Portfolio", href: "#" },
  { label: "Contact", href: "#" },
];

const services = [
  { label: "Meta Ads", href: "#" },
  { label: "Google Ads", href: "#" },
  { label: "SEO", href: "#" },
  { label: "Social Media", href: "#" },
  { label: "WhatsApp Marketing", href: "#" },
  { label: "AI Marketing", href: "#" },
];

const socials = [
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaYoutube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-[#070710] pt-16 pb-8 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1 — Brand */}
          <div className="space-y-5">
            <a href="#" className="inline-block">
              <span className="text-2xl font-bold bg-gradient-to-r from-[#00D4FF] to-[#7B2FF7] bg-clip-text text-transparent">
                Growth Arc Media
              </span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Data-driven digital marketing agency helping brands scale with
              performance marketing, AI-powered strategies, and creative
              storytelling.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] text-gray-400 hover:bg-[#00D4FF] hover:text-white transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 text-sm hover:text-[#00D4FF] transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Services */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Services
            </h4>
            <ul className="space-y-3">
              {services.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 text-sm hover:text-[#00D4FF] transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-[#00D4FF] mt-0.5">&#9993;</span>
                <a
                  href="mailto:hello@growtharcmedia.com"
                  className="hover:text-[#00D4FF] transition-colors duration-200"
                >
                  hello@growtharcmedia.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00D4FF] mt-0.5">&#9742;</span>
                <a
                  href="tel:+919876543210"
                  className="hover:text-[#00D4FF] transition-colors duration-200"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00D4FF] mt-0.5">&#9906;</span>
                <span>
                  Mumbai, Maharashtra,
                  <br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 mb-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <p className="text-center md:text-left">
            Powered by AI. Driven by Data. Built for Growth.
          </p>
          <p className="text-center md:text-right">
            &copy; 2026 Growth Arc Media. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
