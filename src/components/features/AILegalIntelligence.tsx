import { Sparkles, FileText, Search } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const features = [
  {
    icon: FileText,
    title: "Instant Briefings",
    desc: "Generate comprehensive summaries of complex appellate decisions in seconds.",
  },
  {
    icon: Search,
    title: "Semantic Exploration",
    desc: "Search by concept or plain English, not just exact keyword matches.",
  },
];

export default function AILegalIntelligence() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {/* Visual — Left on desktop */}
          <motion.div variants={fadeUp} className="order-2 lg:order-1 relative h-[500px] rounded-xl overflow-hidden bg-surface-container-low p-8 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Abstract glowing lines representing AI and neural networks"
              className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-60 mix-blend-multiply dark:mix-blend-normal"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRpAMasYgyeTcPRjxHSXgKuRfJdc0ie0N3ZmgqKIS6srIBdMISX2nFZSJNVh46LHTLdM7CiJDTd8Wh10mvKVnqbxNc6i-uax8UT39TAMI4zJ8dWq1VxuzS_XZP0u9MxTNgxZOUhyuy8vdQIUoqBRR4RNZlj7GvVJPk087iKmL5YHdsG7m7FmLvYMuk9qdaQxyy0z8XFxcBU-e7jNC3ifOEaezPJ9a1yuWUpZ5xYIh2Zzk9VaVf0K6Pnh4K3Gl96no_TWLZAEv-bA0"
            />
            {/* Glassmorphic Citation Card */}
            <div className="relative z-10 w-full max-w-md bg-glass rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-outline-variant/20">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-label text-xs font-semibold tracking-wider text-primary uppercase">
                  Smart Summary
                </span>
              </div>
              <h4 className="font-body text-xl font-bold mb-3 text-on-surface">
                Miranda v. Arizona (1966)
              </h4>
              <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-4">
                The Supreme Court ruled that detained criminal suspects, prior
                to police questioning, must be informed of their constitutional
                right to an attorney and against self-incrimination.
              </p>
              <div className="flex gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label bg-secondary-container text-on-secondary-container">
                  Fifth Amendment
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-label bg-surface-container-high text-on-surface">
                  Precedent
                </span>
              </div>
            </div>
          </motion.div>

          {/* Text — Right on desktop */}
          <motion.div variants={fadeUp} className="order-1 lg:order-2">
            <h2 className="font-headline text-sm font-bold tracking-widest text-primary uppercase mb-4">
              AI Legal Intelligence
            </h2>
            <h3 className="font-headline text-4xl font-bold mb-6 text-on-surface">
              Clarity through <br />
              Computational Logic.
            </h3>
            <p className="font-body text-lg text-on-surface-variant mb-8 leading-relaxed">
              Bypass archaic boolean queries. Engage with a natural language
              interface that comprehends legal nuances, instantly synthesizes
              extensive rulings, and delivers concise, actionable intelligence
              directly to your reading view.
            </p>
            <ul className="space-y-6">
              {features.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  <div className="mt-1 bg-surface-container-low p-2 rounded-lg text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-headline text-lg font-semibold mb-1">
                      {title}
                    </h4>
                    <p className="font-body text-on-surface-variant text-base">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
