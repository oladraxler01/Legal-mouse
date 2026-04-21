import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/about#contact", label: "Contact" },
  { href: "/careers", label: "Careers" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/10 transition-colors duration-300">
      <div className="w-full px-12 py-16 flex flex-col md:flex-row justify-between items-start md:items-center max-w-7xl mx-auto gap-8">
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold text-on-surface font-headline">
            Legal Mouse
          </span>
          <span className="font-body text-sm text-on-surface-variant">
            © 2025 Legal Mouse. Precision in every citation.
          </span>
        </div>
        <div className="flex flex-wrap gap-8">
          {footerLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant hover:text-primary hover:underline underline-offset-4 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
