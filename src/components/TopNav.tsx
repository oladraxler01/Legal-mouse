"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-outline-variant/10 transition-colors duration-300">
      <div className="flex h-20 items-center px-8 w-full max-w-screen-2xl mx-auto relative relative">
        {/* Left: Logo */}
        <div className="w-1/4 flex items-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-on-surface font-headline"
          >
            Legal Mouse
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex justify-center items-center gap-10 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`font-label text-[13px] font-semibold tracking-wide transition-colors duration-200 ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-primary dark:hover:text-primary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth & Toggles */}
        <div className="flex w-1/4 justify-end items-center gap-6 ml-auto">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface focus:outline-none"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-zinc-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          
          <Link
            href="/login"
            className="hidden md:block font-label text-sm text-zinc-900 font-medium tracking-wide hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden md:block bg-[#7f22ce] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#6b21a8] transition-colors shadow-sm"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 text-on-surface"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-6 py-6 space-y-3">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block font-label font-medium py-2 transition-colors ${
                pathname === href ? "text-primary" : "text-on-surface hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
          <hr className="border-outline-variant/20 my-3" />
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-primary font-label font-semibold py-2">
            Log In
          </Link>
          <Link href="/register" onClick={() => setMobileOpen(false)} className="block bg-gradient-to-br from-primary to-primary-container text-white font-label font-semibold py-3 px-6 rounded-md text-center">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
