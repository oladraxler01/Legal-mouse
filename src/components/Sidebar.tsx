"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, FileText, Scale, Users, UserCircle } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/cases", label: "Cases", icon: Scale },
  { href: "/community", label: "Community", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#000000] border-r border-white/5 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-8 flex-shrink-0" style={{ height: '80px' }}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-primary-container p-1.5 rounded-lg">
            <Scale className="h-6 w-6 text-on-primary" />
          </div>
          <span className="text-xl font-headline font-bold text-on-surface tracking-tight">
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
                  : "text-on-surface-variant/60 hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : "text-on-surface-variant/40 group-hover:text-primary/70"}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Profile/Footer */}
      <div className="p-4 mt-auto border-t border-white/5">
         <div className="bg-surface-container-low/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
              U
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-on-surface truncate">Workspace</p>
               <p className="text-[10px] text-on-surface-variant truncate">Institutional Access</p>
            </div>
         </div>
      </div>
    </aside>
  );
}
