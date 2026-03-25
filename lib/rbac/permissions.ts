import type { UserRole } from "@/types/auth";

export type AppRoute =
  | "/dashboard"
  | "/admin"
  | "/students"
  | "/assessments"
  | "/class-results"
  | "/headteacher"
  | "/principal"
  | "/materials"
  | "/notifications";

const routeAccess: Record<AppRoute, UserRole[]> = {
  "/dashboard": [
    "SUPER_ADMIN",
    "ADMIN",
    "SUBJECT_TEACHER",
    "CLASS_TEACHER",
    "HEADTEACHER",
    "PRINCIPAL",
  ],
  "/admin": ["SUPER_ADMIN", "ADMIN"],
  "/students": ["SUPER_ADMIN", "ADMIN", "CLASS_TEACHER", "HEADTEACHER", "PRINCIPAL"],
  "/assessments": ["SUBJECT_TEACHER", "CLASS_TEACHER", "ADMIN", "SUPER_ADMIN"],
  "/class-results": ["CLASS_TEACHER", "HEADTEACHER", "PRINCIPAL", "ADMIN", "SUPER_ADMIN"],
  "/headteacher": ["HEADTEACHER", "PRINCIPAL", "ADMIN", "SUPER_ADMIN"],
  "/principal": ["PRINCIPAL", "SUPER_ADMIN"],
  "/materials": [
    "SUPER_ADMIN",
    "ADMIN",
    "SUBJECT_TEACHER",
    "CLASS_TEACHER",
    "HEADTEACHER",
    "PRINCIPAL",
  ],
  "/notifications": ["ADMIN", "SUPER_ADMIN", "HEADTEACHER", "PRINCIPAL"],
};

export function canAccess(route: AppRoute, role: UserRole) {
  return routeAccess[route].includes(role);
}
