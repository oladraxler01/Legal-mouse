import { BookOpen, MessageSquare, ArrowRight } from "lucide-react";

const cards = [
  {
    icon: BookOpen,
    title: "Smart Case Briefs",
    desc: "Access our peer-reviewed directory of structured briefs. Instantly isolate Facts, Issues, Rules, and Decisions without losing the editorial nuance of the original text.",
    link: "Explore Directory",
  },
  {
    icon: MessageSquare,
    title: "Private Chambers",
    desc: "Join the Interaction Hub to form study groups. Engage in high-level peer-to-peer discourse in secure, distraction-free environments designed for rigorous academic debate.",
    link: "Find a Group",
  },
];

export default function SmartNotesFeature() {
  return (
    <section className="mt-12 mx-4 lg:mx-auto max-w-7xl bg-surface-container-low rounded-3xl px-8 py-24">
      <div className="text-center mb-16">
        <h2 className="font-headline text-sm font-bold tracking-widest uppercase text-primary mb-4">
          Structure &amp; Discourse
        </h2>
        <h3 className="font-headline text-3xl md:text-4xl font-bold max-w-2xl mx-auto text-on-surface">
          Curated Knowledge, Shared Wisdom.
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {cards.map(({ icon: Icon, title, desc, link }) => (
          <div
            key={title}
            className="bg-surface-container-lowest p-10 rounded-xl hover:bg-surface-container transition-colors duration-300 group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-6">
              <Icon className="h-6 w-6" />
            </div>
            <h4 className="font-headline text-2xl font-bold mb-4 text-on-surface">
              {title}
            </h4>
            <p className="font-body text-on-surface-variant mb-6 leading-relaxed">
              {desc}
            </p>
            <span className="font-label text-sm uppercase font-bold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer">
              {link}{" "}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
