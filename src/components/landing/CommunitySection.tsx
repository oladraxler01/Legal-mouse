"use client";

import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
const testimonials = [
  {
    initials: "AJ",
    name: "Alex J.",
    school: "Oxford University",
    quote:
      "\u201CLegal Mouse didn\u2019t just help me pass my Jurisprudence exams; it fundamentally changed how I structure my legal arguments. The shared private chambers are invaluable.\u201D",
  },
  {
    initials: "SK",
    name: "Sarah K.",
    school: "Harvard Law School",
    quote:
      "\u201CThe AI extraction tool cuts down reading time by hours without losing the nuance of the judges\u2019 dicta. It\u2019s the cleanest, most focused tool I\u2019ve used.\u201D",
  },
];

const stats = [
  { label: "Peer-Reviewed Briefs", value: "8,500+" },
  { label: "Active Study Chambers", value: "1,200+" },
  { label: "Expert Curators", value: "350+" },
];

export default function CommunitySection() {
  return (
    <section className="py-24">
      <motion.div 
        className="max-w-7xl mx-auto px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-primary mb-4">
            Community Intelligence
          </h2>
          <h3 className="font-headline text-3xl md:text-4xl font-bold max-w-2xl mx-auto text-on-surface">
            Vetted by Top Legal Minds.
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonials */}
          {testimonials.map(({ initials, name, school, quote }) => (
            <motion.div
              variants={fadeUp}
              key={name}
              className="bg-surface-container-low p-8 rounded-2xl relative"
            >
              <Quote className="h-10 w-10 text-primary/20 absolute top-6 right-6" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center font-bold text-lg font-headline">
                  {initials}
                </div>
                <div>
                  <h5 className="font-headline font-bold text-on-surface">
                    {name}
                  </h5>
                  <p className="font-label text-xs text-on-surface-variant">
                    {school}
                  </p>
                </div>
              </div>
              <p className="font-body text-on-surface-variant italic leading-relaxed">
                {quote}
              </p>
            </motion.div>
          ))}

          {/* Contributor Network Stats */}
          <motion.div variants={fadeUp} className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-2xl text-white flex flex-col justify-center shadow-ambient">
            <h5 className="font-headline text-xl font-bold mb-6">
              Contributor Network
            </h5>
            <div className="space-y-4">
              {stats.map(({ label, value }, i) => (
                <div
                  key={label}
                  className={`flex justify-between items-center ${
                    i < stats.length - 1
                      ? "border-b border-white/20 pb-4"
                      : "pt-2"
                  }`}
                >
                  <span className="font-body text-sm text-primary-fixed-dim">
                    {label}
                  </span>
                  <span className="font-headline font-extrabold text-xl">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
