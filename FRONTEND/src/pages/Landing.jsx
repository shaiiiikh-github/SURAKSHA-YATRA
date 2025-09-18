// src/pages/Landing.jsx

import { motion } from "framer-motion";
import FeatureCard from "../components/landing/FeatureCard.jsx";
import StatsCard from "../components/landing/StatsCard.jsx";
import Header from "../components/Header.jsx"; // Import the new Header
import { FiPhoneCall } from "react-icons/fi";
import { Player } from "@lottiefiles/react-lottie-player";
import { Link } from "react-router-dom";

export default function Landing() {
  const cardVariants = (i) => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.5 },
    },
  });

  return (
    <div className="font-sans bg-gray-50 text-gray-800 relative overflow-x-hidden">
      <Header /> {/* <-- ADD THE HEADER HERE */}

     {/* --- UPGRADED HERO SECTION --- */}
<section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gray-900 text-white">
  {/* Dynamic Aurora Background Effect */}
  <div className="absolute top-0 left-0 w-full h-full opacity-40">
    <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-blue-600 rounded-full filter blur-3xl animate-blob"></div>
    <div className="absolute top-[20%] right-[5%] w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
    <div className="absolute bottom-[10%] left-[25%] w-96 h-96 bg-purple-600 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
  </div>

  <div className="container relative z-10 mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between">
    {/* Left Column: Text Content */}
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
    >
      <h1 className="text-4xl md:text-6xl font-black leading-tight drop-shadow-lg">
        Smart Tourist Safety System
      </h1>
      <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0">
        Real-time monitoring, AI alerts, and blockchain-secure digital IDs for a safer travel experience.
      </p>
      
      {/* Upgraded Call-to-Action Button */}
      <Link to="/signup" className="mt-10 inline-block">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all"
        >
          Get Started for Free
        </motion.button>
      </Link>

      {/* Social Proof Section */}
      <div className="mt-8 text-sm text-gray-400">
        <p>Blockchain Certified & Trusted by Tourists Worldwide</p>
      </div>
    </motion.div>

    {/* Right Column: Lottie Animation */}
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="lg:w-1/2 flex justify-center"
>
 <Player
  autoplay
  loop
  // --- NEW LOCAL FILE PATH ---
  src="/Login.json"
  className="w-full max-w-md"
/>
</motion.div>
  </div>
</section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
            Everything You Need for a Secure Journey
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Geo-Fencing Alerts", desc: "Get notified when entering high-risk zones.", icon: "📍" },
              { title: "Panic Button", desc: "Instant SOS alerts to authorities & contacts.", icon: "🚨" },
              { title: "AI Anomaly Detection", desc: "Behavior tracking & predictive alerts.", icon: "🤖" },
              { title: "Blockchain ID", desc: "Tamper-proof digital IDs for tourists.", icon: "🛡️" },
            ].map((feat, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={cardVariants(i)}
              >
                <FeatureCard title={feat.title} description={feat.desc} icon={feat.icon} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="impact" className="py-24 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Impact in Numbers</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { label: "Tourists Protected", value: 12500 },
              { label: "Incidents Prevented", value: 342 },
              { label: "Safety Score", value: 91, suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={cardVariants(i)}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => alert("SOS Activated! This would contact authorities and your emergency contacts.")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-bold shadow-2xl animate-pulse"
        >
          <FiPhoneCall className="text-xl" />
          SOS
        </motion.button>
      </div>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Ready to Travel Safely?</h2>
          <p className="mb-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of tourists experiencing smart, secure, and stress-free journeys.
          </p>
          <Link to="/signup">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-transform transform hover:scale-105">
              Sign Up Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-10 text-center">
        <p>© 2025 SafeTravel. All rights reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <a href="#" className="hover:text-yellow-400 transition-colors">Twitter</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}