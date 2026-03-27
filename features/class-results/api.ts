import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { getToken } from "@/lib/auth/token";
import type {
  AggregateResult,
  BulkReportCardsResponse,
  ClassResultsStatusItem,
  ClassResultStudentRow,
  ReportCardResponse,
  SubjectPositionsResponse,
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

export function getBulkReportCards(classId: string, termId: string) {
  return apiRequest<BulkReportCardsResponse>(API_ENDPOINTS.classResults.reportCards(classId, termId));
}

export function getSubjectPositions(classId: string, termId: string, subjectId: string) {
  return apiRequest<SubjectPositionsResponse>(
    API_ENDPOINTS.classResults.subjectPositions(classId, termId, subjectId),
  );
}

export function getReportCard(classId: string, termId: string, studentId: string) {
  return apiRequest<ReportCardResponse>(
    API_ENDPOINTS.classResults.reportCard(classId, termId, studentId),
  );
}

export async function downloadReportCardPdf(classId: string, termId: string, studentId: string) {
  const token = getToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  const response = await fetch(`${baseUrl}${API_ENDPOINTS.classResults.reportCardPdf(classId, termId, studentId)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error("Failed to download report card PDF");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `report-card-${studentId}-${termId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
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
