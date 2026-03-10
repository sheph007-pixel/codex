import {
  Building2,
  Users,
  Star,
  Flag,
  Archive,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const APP_VERSION = "3.0.0";
const PUBLISH_DATE = "2026-03-10";

const navItems = [
  { label: "All Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/contacts?view=companies", icon: Building2 },
  { label: "Starred", href: "/contacts?filter=starred", icon: Star },
  { label: "Flagged", href: "/contacts?filter=flagged", icon: Flag },
  { label: "Archived", href: "/contacts?filter=archived", icon: Archive },
];

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-card flex flex-col">
        <div className="flex items-center gap-2 px-4 h-14 border-b">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Kennion CRM</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Version badge at bottom of sidebar */}
        <div className="px-3 py-3 border-t text-[10px] text-muted-foreground/60">
          v{APP_VERSION} &middot; {PUBLISH_DATE}
        </div>
      </aside>

      {/* Main content area with top bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-end gap-3 px-6 h-11 border-b bg-card shrink-0">
          <span
            className="text-[11px] text-muted-foreground font-mono tabular-nums"
            title={`Version ${APP_VERSION} published ${PUBLISH_DATE}`}
          >
            v{APP_VERSION} &middot; {PUBLISH_DATE}
          </span>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      </div>
    </div>
  );
}
