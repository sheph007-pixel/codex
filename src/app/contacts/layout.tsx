"use client";

import {
  Building2,
  Users,
  Star,
  Flag,
  Archive,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, isDemoMode } from "@/lib/auth-context";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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
  const { user, loading, error: authError, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) return null;

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
          {isDemoMode() && (
            <span className="text-[11px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
              Demo Mode
            </span>
          )}
          <span
            className="text-[11px] text-muted-foreground font-mono tabular-nums"
            title={`Version ${APP_VERSION} published ${PUBLISH_DATE}`}
          >
            v{APP_VERSION} &middot; {PUBLISH_DATE}
          </span>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="h-7 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      </div>
    </div>
  );
}
