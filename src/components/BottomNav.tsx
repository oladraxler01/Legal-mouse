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

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#000000]/80 backdrop-blur-3xl border-t border-white/5">
      <div className="flex items-center justify-around py-3 px-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1.5 px-3 py-1 transition-all duration-300 ${
                isActive ? "text-primary scale-110" : "text-on-surface-variant/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-on-surface-variant/40"}`} />
              <span className={`text-[10px] font-label font-bold tracking-wider uppercase ${isActive ? "opacity-100" : "opacity-0"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
