import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

export default function FeatureCard({ title, description, icon }) {
  return (
    <Tilt
      tiltMaxAngleX={20}
      tiltMaxAngleY={20}
      perspective={1000}
      glareEnable={true}
      glareMaxOpacity={0.25}
      scale={1.02}
      transitionSpeed={400}
      className="w-full"
    >
      <motion.div
        whileHover={{ scale: 1.07, boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 120, damping: 12 }}
        className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center text-center shadow-lg cursor-pointer border border-white/20"
      >
        {/* Icon */}
        <motion.div
          whileHover={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-6xl mb-5"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h3 className="font-extrabold text-2xl mb-3 text-gray-900 drop-shadow-md">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-700">{description}</p>

        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-full h-full rounded-3xl pointer-events-none bg-gradient-to-tr from-yellow-400/20 via-pink-400/10 to-purple-500/10 blur-3xl"></div>
      </motion.div>
    </Tilt>
  );
}
