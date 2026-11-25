import {
  Home,
  MessageSquare,
  FileText,
  Scale,
  Users,
  UserCircle,
  PlaySquare,
  Gavel,
  UsersRound,
  Lightbulb,
  Upload,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  /** Where it sits in the desktop sidebar: main list (default), the "More" dropdown, or the account card. */
  section?: "more" | "account";
}

/** Every feature in the app. The desktop sidebar and the mobile menu both use this list. */
export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/notes", label: "Summary Notes", shortLabel: "Notes", icon: FileText },
  { href: "/authorities", label: "Authorities", icon: Scale },
  { href: "/videos", label: "Video Vault", shortLabel: "Videos", icon: PlaySquare },
  { href: "/coach", label: "Moot Court Coach", shortLabel: "Coach", icon: Gavel },
  { href: "/community", label: "Community", icon: Users },
  { href: "/groups", label: "Study Groups", shortLabel: "Groups", icon: UsersRound, section: "more" },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/insights", label: "Legal Insights", shortLabel: "Insights", icon: Lightbulb, section: "more" },
  { href: "/contribute", label: "Contribute", icon: Upload, section: "more" },
  { href: "/profile", label: "Profile", icon: UserCircle, section: "account" },
];

/** The four shortcuts on the mobile bottom bar (the fifth slot is "More"). */
export const MOBILE_PRIMARY = ["/dashboard", "/notes", "/coach", "/community"];

/** True when `pathname` is this link's page or one of its sub-pages. */
export function isActiveLink(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
