import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function StatsCard({ label, value, suffix = "", icon }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const increment = end / (duration / 20);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setCount(Math.floor(start));
    }, 20);

    return () => clearInterval(counter);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.07, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 120, damping: 12 }}
      className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg cursor-pointer border border-white/20"
    >
      {/* Optional Icon */}
      {icon && <div className="text-5xl mb-3">{icon}</div>}

      {/* Animated Number */}
      <motion.p className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500">
        {count}{suffix}
      </motion.p>

      {/* Label */}
      <p className="mt-2 text-lg font-semibold text-gray-100">{label}</p>

      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-full rounded-3xl pointer-events-none bg-gradient-to-tr from-yellow-400/20 via-pink-400/10 to-purple-500/10 blur-3xl"></div>
    </motion.div>
  );
}
