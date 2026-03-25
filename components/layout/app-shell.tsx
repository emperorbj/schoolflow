"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/lib/auth/token";
import { canAccess, type AppRoute } from "@/lib/rbac/permissions";
import type { CurrentUser } from "@/types/auth";

type AppShellProps = {
  user: CurrentUser;
  children: React.ReactNode;
};

const navItems: { href: AppRoute; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
  { href: "/students", label: "Students" },
  { href: "/assessments", label: "Assessments" },
  { href: "/class-results", label: "Class Results" },
  { href: "/headteacher", label: "Headteacher" },
  { href: "/principal", label: "Principal" },
  { href: "/materials", label: "Materials" },
  { href: "/notifications", label: "Notifications" },
];

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const allowedItems = navItems.filter((item) => canAccess(item.href, user.role));

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

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
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
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
