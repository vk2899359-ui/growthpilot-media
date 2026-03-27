import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  3D Scene Components                                                */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  const ref = useRef();

  const positions = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00D4FF"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

function RotatingIcosahedron() {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.3;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 1]} />
      <meshBasicMaterial
        color="#00D4FF"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

function GoldAccentRing() {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 0.15;
      meshRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2.2, 0.015, 16, 100]} />
      <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
    </mesh>
  );
}

function AuditScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <FloatingParticles />
      <RotatingIcosahedron />
      <GoldAccentRing />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Form + Layout                                                      */
/* ------------------------------------------------------------------ */

const budgetOptions = [
  "Under ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000 - ₹5,00,000",
  "₹5,00,000 - ₹10,00,000",
  "₹10,00,000+",
];

const inputClass =
  "w-full bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-4 text-white placeholder-gray-500 focus:border-[#00D4FF] focus:outline-none transition-colors duration-300";

const labelClass = "block text-sm text-gray-400 mb-2";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function FreeAudit() {
  return (
    <section
      id="free-audit"
      className="relative min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 50%, rgba(0,212,255,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Get Your{" "}
            <span className="text-[#FFD700]">Free</span>{" "}
            Digital Marketing Audit{" "}
            <span className="text-[#00D4FF]">Worth ₹25,000</span>
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Discover untapped growth opportunities for your brand
          </p>
        </motion.div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Form */}
          <motion.form
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="audit-name" className={labelClass}>
                Name
              </label>
              <input
                id="audit-name"
                type="text"
                placeholder="Your full name"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="audit-email" className={labelClass}>
                Email
              </label>
              <input
                id="audit-email"
                type="email"
                placeholder="you@company.com"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="audit-phone" className={labelClass}>
                Phone
              </label>
              <input
                id="audit-phone"
                type="tel"
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="audit-website" className={labelClass}>
                Website URL
              </label>
              <input
                id="audit-website"
                type="url"
                placeholder="https://yourwebsite.com"
                className={inputClass}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="audit-budget" className={labelClass}>
                Monthly Budget
              </label>
              <select id="audit-budget" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Select your monthly budget
                </option>
                {budgetOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-[#00D4FF] px-8 py-4 text-lg font-semibold text-[#0A0A0F] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  boxShadow:
                    "0 0 20px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)",
                }}
              >
                Get My Free Audit
              </button>
            </motion.div>
          </motion.form>

          {/* Right: 3D Scene */}
          <div className="hidden lg:block h-[550px] rounded-2xl overflow-hidden">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-gray-500">
                  Loading...
                </div>
              }
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                dpr={[1, 2]}
                style={{ background: "transparent" }}
              >
                <AuditScene />
              </Canvas>
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
