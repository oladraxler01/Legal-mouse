"use client";

import { Building2, RefreshCw, Plus } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const universities = [
  { name: "LSE", label: "Module Aligned", offset: false },
  { name: "Oxford", label: "Reading Lists", offset: true },
  { name: "Harvard", label: "Casebooks", offset: false },
];

export default function IntegrationFeature() {
  return (
    <section className="my-12 mx-4 lg:mx-auto max-w-7xl bg-surface-container-low rounded-3xl px-8 py-24">
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="p-4 lg:p-12">
          <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-primary mb-4">
            Seamless Integration
          </h2>
          <h3 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-on-surface">
            Built for the Elite Curriculum.
          </h3>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
            Legal Mouse maps directly onto the reading lists and core modules of
            the world&apos;s top law schools. Whether you&apos;re dissecting
            English Public Law or American Constitutional Law, our ecosystem
            adapts to your syllabus.
          </p>
          <div className="space-y-6">
            {[
              {
                icon: Building2,
                title: "Curriculum Sync",
                desc: "Pre-loaded case clusters for LSE, Oxford, and Harvard core modules.",
              },
              {
                icon: RefreshCw,
                title: "Reference Export",
                desc: "One-click OSCOLA and Bluebook citation exports for essays.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm text-primary flex-shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-on-surface">
                    {title}
                  </h4>
                  <p className="font-body text-sm text-on-surface-variant">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* University Grid */}
        <motion.div variants={fadeUp} className="flex justify-center p-4">
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {universities.map(({ name, label, offset }) => (
              <div
                key={name}
                className={`bg-surface-container-lowest p-6 rounded-xl shadow-ambient flex flex-col items-center justify-center text-center aspect-square ${
                  offset ? "translate-y-8" : ""
                }`}
              >
                <span className="font-headline font-black text-2xl text-on-surface mb-2">
                  {name}
                </span>
                <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  {label}
                </span>
              </div>
            ))}
            <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-xl shadow-ambient flex flex-col items-center justify-center text-center aspect-square translate-y-8">
              <Plus className="h-8 w-8 text-white mb-2" />
              <span className="font-label text-xs text-white uppercase tracking-wider font-bold">
                More Coming
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
