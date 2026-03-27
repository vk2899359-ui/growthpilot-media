import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Points, PointMaterial } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  3D Scene Components                                                */
/* ------------------------------------------------------------------ */

function Globe() {
  const meshRef = useRef();
  const pointsRef = useRef();

  // Generate points distributed on a sphere surface
  const { positions, connections } = useMemo(() => {
    const count = 120;
    const radius = 1.8;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }

    // Build connection lines between nearby points
    const lineVerts = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.1) {
          lineVerts.push(
            pos[i * 3],
            pos[i * 3 + 1],
            pos[i * 3 + 2],
            pos[j * 3],
            pos[j * 3 + 1],
            pos[j * 3 + 2]
          );
        }
      }
    }

    return { positions: pos, connections: new Float32Array(lineVerts) };
  }, []);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(connections, 3)
    );
    return geo;
  }, [connections]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Wireframe sphere shell */}
      <mesh>
        <sphereGeometry args={[1.78, 24, 24]} />
        <meshBasicMaterial
          color="#00D4FF"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Glowing dots on the surface */}
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00D4FF"
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </Points>

      {/* Connection lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#00D4FF"
          transparent
          opacity={0.15}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

function FloatingShapes() {
  const octRef = useRef();
  const torusRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (octRef.current) {
      octRef.current.rotation.x = t * 0.3;
      octRef.current.rotation.y = t * 0.2;
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.2;
      torusRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <>
      <Float speed={2} rotationIntensity={0} floatIntensity={1.5}>
        <mesh ref={octRef} position={[-3.2, 1.8, -2]}>
          <octahedronGeometry args={[0.4, 0]} />
          <meshBasicMaterial
            color="#FFD700"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0} floatIntensity={1.2}>
        <mesh ref={torusRef} position={[3, -2, -1.5]}>
          <torusGeometry args={[0.5, 0.15, 8, 16]} />
          <meshBasicMaterial
            color="#00D4FF"
            wireframe
            transparent
            opacity={0.2}
          />
        </mesh>
      </Float>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <Stars
        radius={50}
        depth={60}
        count={1500}
        factor={3}
        saturation={0}
        fade
        speed={0.5}
      />
      <Globe />
      <FloatingShapes />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Typewriter Animation                                               */
/* ------------------------------------------------------------------ */

const agencyName = "Growth Arc Media";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const charVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

function TypewriterTitle() {
  return (
    <motion.h1
      className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-tight"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={agencyName}
    >
      {agencyName.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={charVariants}
          className={
            char === " "
              ? "inline-block w-[0.3em]"
              : "inline-block bg-gradient-to-r from-[#00D4FF] via-white to-[#FFD700] bg-clip-text text-transparent"
          }
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      {/* Blinking cursor */}
      <motion.span
        className="inline-block w-[3px] h-[0.85em] bg-[#00D4FF] ml-1 align-baseline"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.h1>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero Component                                                     */
/* ------------------------------------------------------------------ */

export default function Hero() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 40%, rgba(0,212,255,0.08) 0%, #0A0A0F 70%)",
      }}
    >
      {/* ---- 3D Canvas ---- */}
      <div className="absolute inset-0 lg:left-1/2 lg:w-1/2 w-full h-full z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true }}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* ---- Content ---- */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-24">
          <div className="lg:w-1/2 space-y-8">
            {/* Typewriter title */}
            <TypewriterTitle />

            {/* Tagline */}
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-lg font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8, ease: "easeOut" }}
            >
              We Don&apos;t Just Market.{" "}
              <span className="text-white font-semibold">
                We Engineer Growth.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.7, ease: "easeOut" }}
            >
              {/* Primary CTA */}
              <a
                href="#audit"
                className="
                  relative inline-flex items-center justify-center
                  px-8 py-4 text-base font-bold uppercase tracking-wide
                  rounded-lg text-black
                  bg-[#00D4FF]
                  shadow-[0_0_24px_rgba(0,212,255,0.45)]
                  hover:shadow-[0_0_36px_rgba(0,212,255,0.65)]
                  hover:brightness-110
                  transition-all duration-300
                "
              >
                Get Free Audit
              </a>

              {/* Secondary CTA */}
              <a
                href="#work"
                className="
                  inline-flex items-center justify-center
                  px-8 py-4 text-base font-bold uppercase tracking-wide
                  rounded-lg text-white
                  border-2 border-white/30
                  hover:border-[#00D4FF] hover:text-[#00D4FF]
                  transition-all duration-300
                "
              >
                Our Work
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0F] to-transparent z-10 pointer-events-none" />
    </section>
  );
}
