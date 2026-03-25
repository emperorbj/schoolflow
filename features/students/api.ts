import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CreateStudentPayload,
  ListStudentsQuery,
  Student,
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
