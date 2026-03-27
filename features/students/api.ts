import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreateStudentPayload,
  CreateStudentPortalPayload,
  ListStudentsQuery,
  Student,
  StudentMyResultsResponse,
  UpdateStudentPayload,
} from "@/types/students";

type StudentsResponse = { students: Student[] };
type StudentResponse = { student: Student };

function toQueryString(params: ListStudentsQuery) {
  const searchParams = new URLSearchParams();
  if (params.classId) {
    searchParams.set("classId", params.classId);
  }
  if (params.q) {
    searchParams.set("q", params.q);
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function listStudents(params: ListStudentsQuery) {
  return apiRequest<StudentsResponse>(`${API_ENDPOINTS.students.list}${toQueryString(params)}`);
}

export function createStudent(payload: CreateStudentPayload) {
  return apiRequest<StudentResponse>(API_ENDPOINTS.students.list, {
    method: "POST",
    body: payload,
  });
}

export function updateStudent(id: string, payload: UpdateStudentPayload) {
  return apiRequest<StudentResponse>(API_ENDPOINTS.students.byId(id), {
    method: "PATCH",
    body: payload,
  });
}

export function deleteStudent(id: string) {
  return apiRequest<void>(API_ENDPOINTS.students.byId(id), {
    method: "DELETE",
  });
}

export function createStudentPortal(id: string, payload: CreateStudentPortalPayload) {
  return apiRequest<StudentResponse>(API_ENDPOINTS.students.portal(id), {
    method: "POST",
    body: payload,
  });
}

export function getStudentMeResults(termId: string) {
  const q = new URLSearchParams({ termId });
  return apiRequest<StudentMyResultsResponse>(
    `${API_ENDPOINTS.students.meResults}?${q.toString()}`,
  );
}
