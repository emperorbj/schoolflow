export const USER_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUBJECT_TEACHER",
  "CLASS_TEACHER",
  "HEADTEACHER",
  "PRINCIPAL",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type CurrentUserPermissions = {
  schoolId: string;
  role: string;
  isClassTeacher: boolean;
  canViewAllClasses: boolean;
  hasTeachingAssignments?: boolean;
  activeTeachingAssignments?: number;
  canUseAssessments?: boolean;
};

export type CurrentUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions?: CurrentUserPermissions;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type BootstrapRegisterPayload = {
  schoolName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};
