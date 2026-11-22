"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Moon, Sun, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { NAV_LINKS, MOBILE_PRIMARY, isActiveLink } from "./navLinks";

export default function BottomNav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu whenever the page changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (moreOpen) setMoreOpen(false);
  }

  const primary = MOBILE_PRIMARY.map((href) => NAV_LINKS.find((l) => l.href === href)!);
  const moreActive = !primary.some((l) => isActiveLink(pathname, l.href));

  return (
    <>
      {/* ── "More" sheet with every feature ─────────── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="md:hidden fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="md:hidden fixed inset-x-0 bottom-0 z-[10001] bg-surface-container-low rounded-t-3xl border-t border-outline-variant/20 shadow-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <h2 className="text-lg font-headline font-bold text-on-surface">All features</h2>
                <button onClick={() => setMoreOpen(false)} aria-label="Close menu" className="p-2 rounded-full bg-surface-container-high text-on-surface-variant">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 px-5">
                {NAV_LINKS.map(({ href, label, shortLabel, icon: Icon }) => {
                  const active = isActiveLink(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-2 text-center transition-colors ${
                        active ? "bg-primary/15 text-primary" : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-[11px] font-bold leading-tight">{shortLabel || label}</span>
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={toggleTheme}
                className="mx-5 mt-4 w-[calc(100%-2.5rem)] flex items-center justify-between rounded-2xl bg-surface-container px-5 py-4 text-on-surface"
              >
                <span className="flex items-center gap-3 text-sm font-bold">
                  {theme === "dark" ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </span>
                <span className={`w-10 h-5 rounded-full p-0.5 transition-colors ${theme === "dark" ? "bg-primary" : "bg-outline-variant"}`}>
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-5" : ""}`} />
                </span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Bottom bar ──────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-2xl border-t border-outline-variant/15 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 h-16">
          {primary.map(({ href, label, shortLabel, icon: Icon }) => {
            const active = isActiveLink(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-primary" : "text-on-surface-variant"}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-bold tracking-wide">{shortLabel || label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            aria-label="All features"
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${moreActive || moreOpen ? "text-primary" : "text-on-surface-variant"}`}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-[10px] font-bold tracking-wide">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
