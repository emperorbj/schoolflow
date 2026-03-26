"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BellRing,
  BookOpenCheck,
  BookCopy,
  ChevronDown,
  ClipboardList,
  Crown,
  GraduationCap,
  LayoutDashboard,
  NotebookPen,
  Settings,
  School,
  UserCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth/token";
import { canAccess, type AppRoute } from "@/lib/rbac/permissions";
import type { CurrentUser } from "@/types/auth";

type AppShellProps = {
  user: CurrentUser;
  children: React.ReactNode;
};

const navItems: { href: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/results", label: "Results", icon: ClipboardList },
  { href: "/materials", label: "Materials", icon: BookCopy },
  { href: "/admin", label: "Admin", icon: School },
  { href: "/students", label: "Students", icon: GraduationCap },
  { href: "/assessments", label: "Assessments", icon: NotebookPen },
  { href: "/class-results", label: "Class Results", icon: ClipboardList },
  { href: "/headteacher", label: "Headteacher", icon: BookOpenCheck },
  { href: "/principal", label: "Principal", icon: Crown },
  { href: "/notifications", label: "Notifications", icon: BellRing },
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const allowedItems =
    user.role === "STUDENT"
      ? navItems.filter((item) => ["/results", "/materials"].includes(item.href))
      : navItems.filter((item) => canAccess(item.href, user.role) && item.href !== "/results");
  const [profileOpen, setProfileOpen] = useState(false);

  const onLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-muted/20 lg:grid-cols-[260px_1fr]">
      <aside className="border-r bg-background px-4 py-6">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Schoolflow
          </p>
          <h1 className="mt-2 text-xl font-semibold">Academic Platform</h1>
        </div>

        <nav className="space-y-1">
          {allowedItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b bg-background px-6 py-4">
          <div>
            <h2 className="font-medium">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <Badge>{user.role.replaceAll("_", " ")}</Badge>
            <div className="relative">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <UserCircle2 className="size-4" />
                Profile
                <ChevronDown className="size-4" />
              </Button>
              {profileOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border bg-popover p-2 shadow-lg">
                  <div className="rounded-lg px-3 py-2">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="size-4" />
                    Profile settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
