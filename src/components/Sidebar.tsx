"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale, Sun, Moon, ChevronDown, MoreHorizontal } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { NAV_LINKS, isActiveLink, type NavLink } from "./navLinks";
import { createClient } from "@/lib/supabase";

function SidebarLink({ link, pathname, compact }: { link: NavLink; pathname: string; compact?: boolean }) {
  const { href, label, icon: Icon } = link;
  const isActive = isActiveLink(pathname, href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-xl px-4 ${compact ? "py-2.5" : "py-3"} text-sm font-label font-bold transition-all duration-300 group ${
        isActive ? "bg-primary/10 text-primary" : "text-on-surface-variant/60 hover:bg-primary/5 hover:text-on-surface"
      }`}
    >
      <Icon
        className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
          isActive ? "text-primary" : "text-on-surface-variant/40 group-hover:text-primary/70"
        }`}
      />
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState<string | null>(null);

  const mainLinks = NAV_LINKS.filter((l) => !l.section);
  const moreLinks = NAV_LINKS.filter((l) => l.section === "more");
  const moreActive = moreLinks.some((l) => isActiveLink(pathname, l.href));
  const [moreOpen, setMoreOpen] = useState(moreActive);
  const [lastPath, setLastPath] = useState(pathname);
  // Open the dropdown automatically when navigating to one of its pages.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (moreActive && !moreOpen) setMoreOpen(true);
  }

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setName((data.user?.user_metadata?.full_name as string) || data.user?.email?.split("@")[0] || null));
  }, []);

  const profileActive = isActiveLink(pathname, "/profile");

  return (
    <aside className="hidden md:flex flex-col w-64 h-[100dvh] fixed left-0 top-0 bg-surface border-r border-outline-variant/10 z-40 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-8 flex-shrink-0" style={{ height: "80px" }}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary-container p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Scale className="h-6 w-6 text-on-primary" />
          </div>
          <span className="text-xl font-headline font-extrabold text-on-surface tracking-tight">Legal Mouse</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-4 mt-4 overflow-y-auto">
        {mainLinks.map((link) => (
          <SidebarLink key={link.href} link={link} pathname={pathname} />
        ))}

        {/* "More" dropdown for the extra features */}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          aria-expanded={moreOpen}
          className={`mt-1 flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-label font-bold transition-all ${
            moreActive && !moreOpen ? "text-primary" : "text-on-surface-variant/60 hover:bg-primary/5 hover:text-on-surface"
          }`}
        >
          <MoreHorizontal className="h-5 w-5 text-on-surface-variant/40" />
          <span className="flex-1 text-left">More</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
        </button>
        {moreOpen && (
          <div className="ml-4 pl-2 border-l border-outline-variant/20 flex flex-col gap-1">
            {moreLinks.map((link) => (
              <SidebarLink key={link.href} link={link} pathname={pathname} compact />
            ))}
          </div>
        )}
      </nav>

      {/* Theme toggle and account */}
      <div className="p-5 mt-auto border-t border-outline-variant/10 space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
            <span className="text-xs font-label font-bold uppercase tracking-wider">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </div>
          <div className={`w-8 h-4 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-primary" : "bg-outline-variant"}`}>
            <div className={`w-2 h-2 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`} />
          </div>
        </button>

        <Link
          href="/profile"
          className={`rounded-2xl p-3.5 flex items-center gap-3 border shadow-sm transition-colors ${
            profileActive ? "bg-primary/10 border-primary/30" : "bg-surface-container-low/50 border-outline-variant/10 hover:bg-surface-container-low"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            {(name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">{name || "My profile"}</p>
            <p className="text-[10px] text-on-surface-variant font-medium truncate opacity-70">View profile & streak</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
