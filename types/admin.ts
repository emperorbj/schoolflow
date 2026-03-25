export type Session = {
  _id: string;
  name: string;
  isActive: boolean;
};

export type Term = {
  _id: string;
  sessionId: string;
  name: string;
  order: number;
  isActive: boolean;
};

export type AcademicClass = {
  _id: string;
  name: string;
  arm: string;
  classTeacherUserId: string | null;
  isActive: boolean;
};

export type Subject = {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
};

export type SchoolUserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUBJECT_TEACHER"
  | "CLASS_TEACHER"
  | "HEADTEACHER"
  | "PRINCIPAL"
  | "STUDENT"
  | "PARENT";

export type SchoolUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: SchoolUserRole;
  schoolId: string;
  classTeacherClassId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateSessionPayload = {
  name: string;
  isActive?: boolean;
};

export type UpdateSessionPayload = Partial<CreateSessionPayload>;

export type CreateTermPayload = {
  sessionId: string;
  name: string;
  order: number;
  isActive?: boolean;
};

export type UpdateTermPayload = {
  name?: string;
  order?: number;
  isActive?: boolean;
};

export type CreateClassPayload = {
  name: string;
  arm: string;
};

export type UpdateClassPayload = {
  name?: string;
  arm?: string;
  classTeacherUserId?: string | null;
  isActive?: boolean;
};

export type CreateSubjectPayload = {
  name: string;
  code: string;
  isActive?: boolean;
};

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

export type CreateTeachingAssignmentPayload = {
  teacherUserId: string;
  classId: string;
  subjectId: string;
  termId: string;
  isActive?: boolean;
};

export type UnassignTeachingAssignmentPayload = {
  teacherUserId: string;
  classId: string;
  subjectId: string;
  termId: string;
};

export type ClassCoverageTeacher = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type ClassCoverageAssignment = {
  id: string;
  teacherUserId: string;
  teacher: ClassCoverageTeacher | null;
  classId: string;
  subjectId: string;
  subject: { id: string; name: string; code: string } | null;
  termId: string;
  term: { id: string; name: string; order: number } | null;
};

export type ClassCoverageResponse = {
  classId: string;
  termId: string | null;
  scopeNote: string;
  assignments: ClassCoverageAssignment[];
  assignedSubjectTeachers: ClassCoverageTeacher[];
  unassignedSubjectTeachers: ClassCoverageTeacher[];
  assignedTeacherIdsNotSubjectTeacherRole: string[];
};

export type CreateSchoolUserPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Exclude<SchoolUserRole, "SUPER_ADMIN">;
};

export type UpdateUserPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: SchoolUserRole;
  classTeacherClassId?: string | null;
  isActive?: boolean;
};
