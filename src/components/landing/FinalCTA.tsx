"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
export default function FinalCTA() {
  return (
    <section
      className="relative w-full px-8 py-32 text-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVcErHQxd8ZkgEKzYC60CpQqAIvN5I3cSjWWIS4N5SWFt1FuTX_4E-6GSci26hWuiBl6ci38ZPj8iHbgsYTFzqkLwrFrePPRpvF0PN0aokrH7ytPzBg3O071-jdF__VNfUcZpa5Dqksea-zTtbb53F3CgaxZ6p7WstDKUMbw7IZlWhaGfiqkb75VJJ7dx2RkhCGx60hvaa9GDR47lTk4P8z4B28czDMPidWART6Ukn3JbnYKk4fA0kk4WhRPWLiQVTsulmBUYhBNA')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <motion.div 
        className="relative z-10 max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} className="font-headline text-4xl md:text-5xl font-bold text-white mb-8">
          Join the Future of Legal Intelligence
        </motion.h2>
        <motion.p variants={fadeUp} className="font-body text-xl text-white/90 mb-10">
          Step into a curated environment where clarity meets rigorous legal
          analysis.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-br from-primary to-primary-container text-white font-label text-lg font-semibold py-4 px-10 rounded-md hover:opacity-90 shadow-ambient transition-all"
          >
            Create Your Account
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
