"use client";

import Link from "next/link";
import { Scale, FileText, Book } from "lucide-react";

export default function AuthoritiesLandingPage() {
  const cards = [
    {
      title: "Cases",
      description: "Explore our curated database of pivotal court rulings and foundational precedents.",
      href: "/authorities/cases",
      icon: Scale,
    },
    {
      title: "Statutes",
      description: "Access structured statutory texts, legislative history, and regulatory frameworks.",
      href: "/authorities/statutes",
      icon: FileText,
    },
    {
      title: "Black's Law Dictionary",
      description: "Reference precise legal definitions and terminology from the definitive source.",
      href: "/authorities/blacks-law",
      icon: Book,
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 md:p-12 pb-40 transition-colors duration-300">
      <header className="mb-12 animate-in fade-in duration-700">
        <h1 className="font-serif text-5xl font-extrabold tracking-tight mb-3 text-on-surface">
          Authorities
        </h1>
        <p className="font-body text-on-surface-variant text-lg">
          The definitive sources of legal intelligence, rigorously organized.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative bg-surface-container border border-outline-variant/20 hover:border-primary/50 rounded-2xl p-8 flex flex-col items-start transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${idx * 150}ms`, animationFillMode: "both" }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                <Icon className="h-7 w-7" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-on-surface mb-4 group-hover:text-primary transition-colors duration-300">
                {card.title}
              </h2>
              <p className="font-body text-on-surface-variant leading-relaxed group-hover:opacity-80 transition-opacity duration-300">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
