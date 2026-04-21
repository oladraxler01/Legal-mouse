"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Scale, Users, UserCircle } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/cases", label: "Cases", icon: Scale },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Scale className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold tracking-tight">
          Legal <span className="text-primary">Mouse</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-4">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-gray-800">
        <p className="text-xs text-muted/60">© 2026 Legal Mouse</p>
      </div>
    </aside>
  );
}
