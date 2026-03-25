import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AcademicClass,
  ClassCoverageResponse,
  CreateClassPayload,
  CreateSessionPayload,
  CreateSchoolUserPayload,
  CreateSubjectPayload,
  CreateTeachingAssignmentPayload,
  CreateTermPayload,
  Session,
  SchoolUser,
  Subject,
  Term,
  UnassignTeachingAssignmentPayload,
  UpdateClassPayload,
  UpdateSessionPayload,
  UpdateSubjectPayload,
  UpdateTermPayload,
  UpdateUserPayload,
} from "@/types/admin";

type SessionsResponse = { sessions: Session[] };
type SessionResponse = { session: Session };
type TermsResponse = { terms: Term[] };
type TermResponse = { term: Term };
type ClassesResponse = { classes: AcademicClass[] };
type ClassResponse = { class: AcademicClass };
type SubjectsResponse = { subjects: Subject[] };
type SubjectResponse = { subject: Subject };
type UsersResponse = { users: SchoolUser[] };
type UserResponse = { user: SchoolUser };

export function listSessions() {
  return apiRequest<SessionsResponse>(API_ENDPOINTS.admin.sessions);
}

export function listUsers() {
  return apiRequest<UsersResponse>(API_ENDPOINTS.admin.users);
}

export function getUserById(id: string) {
  return apiRequest<UserResponse>(API_ENDPOINTS.admin.userById(id));
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return apiRequest<UserResponse>(API_ENDPOINTS.admin.userById(id), {
    method: "PATCH",
    body: payload,
  });
}

export function deleteUser(id: string) {
  return apiRequest<void>(API_ENDPOINTS.admin.userById(id), {
    method: "DELETE",
  });
}

export function createSchoolUser(payload: CreateSchoolUserPayload) {
  return apiRequest<UserResponse>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: payload,
  });
}

export function createSession(payload: CreateSessionPayload) {
  return apiRequest<SessionResponse>(API_ENDPOINTS.admin.sessions, {
    method: "POST",
    body: payload,
  });
}

export function updateSession(id: string, payload: UpdateSessionPayload) {
  return apiRequest<SessionResponse>(`${API_ENDPOINTS.admin.sessions}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSession(id: string) {
  return apiRequest<void>(`${API_ENDPOINTS.admin.sessions}/${id}`, {
    method: "DELETE",
  });
}

export function listTerms(sessionId?: string) {
  const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : "";
  return apiRequest<TermsResponse>(`${API_ENDPOINTS.admin.terms}${query}`);
}

export function createTerm(payload: CreateTermPayload) {
  return apiRequest<TermResponse>(API_ENDPOINTS.admin.terms, {
    method: "POST",
    body: payload,
  });
}

export function updateTerm(id: string, payload: UpdateTermPayload) {
  return apiRequest<TermResponse>(`${API_ENDPOINTS.admin.terms}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function listClasses() {
  return apiRequest<ClassesResponse>(API_ENDPOINTS.admin.classes);
}

export function createClass(payload: CreateClassPayload) {
  return apiRequest<ClassResponse>(API_ENDPOINTS.admin.classes, {
    method: "POST",
    body: payload,
  });
}

export function updateClass(id: string, payload: UpdateClassPayload) {
  return apiRequest<ClassResponse>(`${API_ENDPOINTS.admin.classes}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteClass(id: string) {
  return apiRequest<void>(`${API_ENDPOINTS.admin.classes}/${id}`, {
    method: "DELETE",
  });
}

export function listSubjects() {
  return apiRequest<SubjectsResponse>(API_ENDPOINTS.admin.subjects);
}

export function createSubject(payload: CreateSubjectPayload) {
  return apiRequest<SubjectResponse>(API_ENDPOINTS.admin.subjects, {
    method: "POST",
    body: payload,
  });
}

export function updateSubject(id: string, payload: UpdateSubjectPayload) {
  return apiRequest<SubjectResponse>(`${API_ENDPOINTS.admin.subjects}/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSubject(id: string) {
  return apiRequest<void>(`${API_ENDPOINTS.admin.subjects}/${id}`, {
    method: "DELETE",
  });
}

export function createTeachingAssignment(payload: CreateTeachingAssignmentPayload) {
  return apiRequest<{ assignment: { _id: string } }>(
    API_ENDPOINTS.admin.teacherSubjectAssignment,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function unassignTeachingAssignment(payload: UnassignTeachingAssignmentPayload) {
  return apiRequest<{ assignment: { _id: string } }>(
    API_ENDPOINTS.admin.teacherSubjectUnassign,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function getClassCoverage(classId: string, termId?: string) {
  const params = new URLSearchParams({ classId });
  if (termId) {
    params.set("termId", termId);
  }
  return apiRequest<ClassCoverageResponse>(
    `${API_ENDPOINTS.admin.classCoverage}?${params.toString()}`,
  );
}
