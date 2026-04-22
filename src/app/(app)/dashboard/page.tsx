import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="font-serif text-muted">Continue where you left off.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "My Notes", desc: "3 recent annotations", href: "/notes" },
          { title: "Case Library", desc: "12 saved cases", href: "/cases" },
          { title: "Study Chambers", desc: "2 active groups", href: "/community" },
        ].map(({ title, desc, href }) => (
          <Link
            key={title}
            href={href}
            className="bg-surface p-6 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-colors group"
          >
            <h3 className="font-headline font-bold text-foreground mb-1">{title}</h3>
            <p className="font-serif text-sm text-muted mb-4">{desc}</p>
            <span className="inline-flex items-center gap-1 font-sans text-sm text-primary font-semibold group-hover:gap-2 transition-all">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
