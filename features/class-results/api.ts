import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AggregateResult,
  ClassResultsStatusItem,
  ClassResultStudentRow,
  UpdateCommentsPayload,
} from "@/types/class-results";

type StatusResponse = { subjects: ClassResultsStatusItem[] };
type StudentsResponse = { students: ClassResultStudentRow[] };

export function getClassResultsStatus(classId: string, termId: string) {
  return apiRequest<StatusResponse>(API_ENDPOINTS.classResults.status(classId, termId));
}

export function aggregateClassResults(classId: string, termId: string) {
  return apiRequest<AggregateResult>(API_ENDPOINTS.classResults.aggregate(classId, termId), {
    method: "POST",
  });
}

export function getClassResultStudents(classId: string, termId: string) {
  return apiRequest<StudentsResponse>(API_ENDPOINTS.classResults.students(classId, termId));
}

export function patchClassResultComments(
  classId: string,
  termId: string,
  payload: UpdateCommentsPayload,
) {
  return apiRequest<{ updated: number }>(API_ENDPOINTS.classResults.comments(classId, termId), {
    method: "PATCH",
    body: payload,
  });
}
