"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserQuery } from "@/features/auth/hooks";
import { canAccess, type AppRoute } from "@/lib/rbac/permissions";

type Props = {
  route: AppRoute;
  children: ReactNode;
};

export function RequireRouteAccess({ route, children }: Props) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUserQuery();

  useEffect(() => {
    if (isLoading || !user) return;
    if (
      !canAccess(route, user.role) ||
      (route === "/assessments" && user.permissions?.canUseAssessments !== true)
    ) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, route, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (
    !canAccess(route, user.role) ||
    (route === "/assessments" && user.permissions?.canUseAssessments !== true)
  ) {
    return null;
  }

  return <>{children}</>;
}
