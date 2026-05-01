"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  FileText, 
  Scale, 
  Users, 
  UserCircle,
  Sun,
  Moon,
  PlaySquare
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/authorities", label: "Authorities", icon: Scale },
  { href: "/videos", label: "Video Vault", icon: PlaySquare },
  { href: "/community", label: "Community", icon: Users },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant/10 z-40 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-8 flex-shrink-0" style={{ height: '80px' }}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary-container p-1.5 rounded-lg shadow-lg shadow-primary/20">
            <Scale className="h-6 w-6 text-on-primary" />
          </div>
          <span className="text-xl font-headline font-extrabold text-on-surface tracking-tight">
            Legal Mouse
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 px-4 mt-6 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-label font-bold transition-all duration-300 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-on-surface-variant/60 hover:bg-primary/5 hover:text-on-surface"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : "text-on-surface-variant/40 group-hover:text-primary/70"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & Profile/Footer */}
      <div className="p-6 mt-auto border-t border-outline-variant/10 space-y-4">
         <button
           onClick={toggleTheme}
           className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-on-surface-variant group"
         >
           <div className="flex items-center gap-3">
             {theme === "dark" ? (
               <Sun className="h-4 w-4 text-primary" />
             ) : (
               <Moon className="h-4 w-4 text-primary" />
             )}
             <span className="text-xs font-label font-bold uppercase tracking-wider">
               {theme === "dark" ? "Light Mode" : "Dark Mode"}
             </span>
           </div>
           <div className={`w-8 h-4 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-primary" : "bg-outline-variant"}`}>
              <div className={`w-2 h-2 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`} />
           </div>
         </button>

         <div className="bg-surface-container-low/50 rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/10 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
              {/* This initials logic can be improved later by passing user data */}
              U
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-on-surface truncate">Workspace</p>
               <p className="text-[10px] text-on-surface-variant font-medium truncate opacity-70">Institutional Access</p>
            </div>
         </div>
      </div>
    </aside>
  );
}
