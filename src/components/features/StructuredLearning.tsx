"use client";

import { Library, GitBranch, BookmarkPlus } from "lucide-react";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const bentoCards = [
  {
    icon: Library,
    title: "Notes Explorer",
    desc: "A minimalist, distraction-free canvas for drafting arguments and organizing thoughts, linked directly to primary sources.",
    span: false,
    offset: false,
  },
  {
    icon: GitBranch,
    title: "Chronological Case Briefs",
    desc: "Map the evolution of legal doctrine with visual timelines that connect precedent to modern interpretation.",
    span: false,
    offset: true,
  },
];

export default function StructuredLearning() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {/* Sticky sidebar text */}
          <motion.div variants={fadeUp} className="lg:col-span-5 lg:sticky top-32">
            <h2 className="font-headline text-sm font-bold tracking-widest text-primary uppercase mb-4">
              Structured Learning
            </h2>
            <h3 className="font-headline text-4xl font-bold mb-6 text-on-surface">
              The Architecture <br />
              of Knowledge.
            </h3>
            <p className="font-body text-lg text-on-surface-variant mb-8 leading-relaxed">
              Transform fragmented reading into a cohesive repository. Organize
              case briefs, personal annotations, and foundational texts into a
              rigorously structured, easily retrievable personal library.
            </p>
          </motion.div>

          {/* Bento grid */}
          <motion.div variants={stagger} className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            {bentoCards.map(({ icon: Icon, title, desc, offset }) => (
              <motion.div
                variants={fadeUp}
                key={title}
                className={`bg-surface p-8 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300 ${
                  offset ? "md:mt-12" : ""
                }`}
              >
                <Icon className="h-8 w-8 text-primary mb-6" />
                <h4 className="font-headline text-xl font-bold mb-3 text-on-surface">
                  {title}
                </h4>
                <p className="font-body text-on-surface-variant text-base">
                  {desc}
                </p>
              </motion.div>
            ))}

            {/* Deep Linking — Full-width bento card */}
            <motion.div variants={fadeUp} className="bg-surface p-8 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low transition-colors duration-300 md:col-span-2">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <BookmarkPlus className="h-8 w-8 text-primary mb-6" />
                  <h4 className="font-headline text-xl font-bold mb-3 text-on-surface">
                    Deep Linking
                  </h4>
                  <p className="font-body text-on-surface-variant text-base">
                    Select any text to create an anchor point. Your notes are
                    eternally tethered to the exact paragraph of the citation.
                  </p>
                </div>
                {/* Mini UI */}
                <div className="w-full md:w-64 bg-surface-container-lowest p-4 rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-outline-variant/20">
                  <div className="h-2 w-12 bg-primary/20 rounded mb-4" />
                  <div className="h-1.5 w-full bg-surface-container-high rounded mb-2" />
                  <div className="h-1.5 w-4/5 bg-surface-container-high rounded mb-4" />
                  <div className="bg-surface-container-low p-2 rounded text-xs font-body text-on-surface-variant border border-outline-variant/20">
                    &quot;Note: Check dissent regarding standard of review.&quot;
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
