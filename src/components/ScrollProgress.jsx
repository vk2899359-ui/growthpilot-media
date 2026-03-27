import { motion, useScroll, useTransform } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      className="fixed top-0 left-0 h-[3px] z-[9999]"
      style={{
        width,
        background: "linear-gradient(to right, #00D4FF, #FFD700)",
      }}
    />
  );
};

export default ScrollProgress;
