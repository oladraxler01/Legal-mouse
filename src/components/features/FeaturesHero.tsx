import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function FeaturesHero() {
  return (
    <header className="relative w-full overflow-hidden pt-32 pb-40 mb-12">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/courtroom-hero.png"
          alt="Modern Courtroom"
          className="w-full h-full object-cover opacity-100 dark:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-surface/60 to-surface" />
      </div>

      <motion.div 
        className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center mt-12"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.h1 variants={fadeUp} className="font-headline text-5xl md:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-tight">
          Intelligence{" "}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
            Beyond the Citation
          </span>
        </motion.h1>
        <motion.p variants={fadeUp} className="font-body text-xl md:text-2xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
          A highly curated, AI-driven environment designed for the modern legal
          mind. Navigate complexities with absolute clarity and precision.
        </motion.p>
      </motion.div>
    </header>
  );
}
