"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HeroSection() {
  return (
    <section
      className="relative w-full px-8 py-20 lg:py-32 flex flex-col items-center text-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfycw32B510ZGDkf8n2rnoutRCrz5FELxX6l_7rjThyVX5CaFJK21IgNYLn1B-XV0HtppbI-Dgl38frfCzhslHviICmoLKecmze8H7siCwZ6F5tmKHl7aCpnU4cWqQBFTbmi8BFEeSmm8nxiPeDvjo9EqFzl2fyfOj2odj7uR3C6o8E5tv2teA5X0lEp9M3RLtWzCewnKkWekWk7CfWHUOYVNAAUlMjJEErYAf4_CFL78-YnyjPsjs993Sfy66McX7jK_cEBOM-q4')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h1 variants={fadeUp} className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-4xl leading-tight">
          Master the Law with <span className="gradient-text">Precision</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="font-body text-xl md:text-2xl text-white/90 max-w-2xl mb-12 leading-relaxed">
          The definitive curation platform for modern legal minds. Elevate your
          research, structure your arguments, and collaborate with unparalleled
          clarity.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/register"
            className="bg-gradient-to-br from-primary to-primary-container text-white font-label text-base font-semibold py-4 px-8 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Start Learning Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
