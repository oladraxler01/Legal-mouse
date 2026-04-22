import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stats = [
  { value: "12.4k+", label: "Citations Analyzed", highlight: false },
  { value: "98%", label: "Academic Rating", highlight: true },
  { value: "50k+", label: "Students Joined", highlight: false },
];

export default function StatsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
        >
          {stats.map(({ value, label, highlight }) => (
            <motion.div
              variants={fadeUp}
              key={label}
              className={`flex flex-col items-center justify-center py-8 ${
                highlight ? "bg-surface-container-low rounded-xl" : ""
              }`}
            >
              <span
                className={`font-headline text-5xl font-extrabold mb-2 ${
                  highlight ? "text-primary" : "text-on-surface"
                }`}
              >
                {value}
              </span>
              <span className="font-body text-on-surface-variant">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
