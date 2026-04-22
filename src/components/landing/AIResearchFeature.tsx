import { CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};
export default function AIResearchFeature() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {/* Text */}
          <motion.div variants={fadeUp} className="lg:col-span-5 pr-8">
            <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-primary mb-4">
              Intelligence
            </h2>
            <h3 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-on-surface">
              AI-Powered Research, Refined.
            </h3>
            <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-8">
              Navigate dense precedents with our proprietary AI Legal Assistant.
              It instantly dissects complex principles, isolates holding
              statements, and translates arcane dictions into actionable
              insights.
            </p>
            <ul className="space-y-4 font-body text-on-surface">
              {[
                "Instant principle extraction from vast case law.",
                "Contextual definitions of historical legal terminology.",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual */}
          <motion.div variants={fadeUp} className="lg:col-span-7 relative h-[500px] rounded-xl bg-surface-container-low p-8 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=2000')",
              }}
            />
            <div className="relative z-10 h-full flex flex-col justify-end">
              <div className="glass-panel p-6 rounded-lg shadow-ambient max-w-md ml-auto border border-outline-variant/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-headline text-sm font-semibold text-on-surface">
                    Legal Assistant
                  </span>
                </div>
                <p className="font-body text-sm text-on-surface mb-4">
                  The holding in{" "}
                  <em>Palsgraf v. Long Island Railroad Co.</em> established that
                  liability for negligence requires a foreseeable plaintiff. The
                  risk reasonably to be perceived defines the duty to be obeyed.
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label text-xs">
                    Tort Law
                  </span>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full font-label text-xs">
                    Foreseeability
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
