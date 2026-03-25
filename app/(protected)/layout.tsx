"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { getToken } from "@/lib/auth/token";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const token = getToken();
  const { data: user, isLoading, isError } = useCurrentUserQuery();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  useEffect(() => {
    if (isError) {
      router.replace("/login");
    }
  }, [isError, router]);

  if (!token || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading your workspace...</p>
      </div>
    );
  }

  return <AppShell user={user}>{children}</AppShell>;
}
