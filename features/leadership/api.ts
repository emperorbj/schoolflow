import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  ClassesOverviewItem,
  LeadershipStudentRow,
  PromotionSuggestion,
  SchoolOverview,
  StudentPerformanceRow,
} from "@/types/leadership";

export function headteacherOverview(termId: string) {
  return apiRequest<SchoolOverview>(
    `${API_ENDPOINTS.headteacher.overview}?termId=${encodeURIComponent(termId)}`,
  );
}

export function headteacherClasses(termId: string) {
  return apiRequest<{ classes: ClassesOverviewItem[] }>(
    `${API_ENDPOINTS.headteacher.classes}?termId=${encodeURIComponent(termId)}`,
  );
}

export function headteacherClassStudents(classId: string, termId: string) {
  return apiRequest<{ students: LeadershipStudentRow[] }>(
    `${API_ENDPOINTS.headteacher.classStudents(classId)}?termId=${encodeURIComponent(termId)}`,
  );
}

export function headteacherStudentPerformance(studentId: string, termId?: string) {
  const query = termId ? `?termId=${encodeURIComponent(termId)}` : "";
  return apiRequest<{ performance: StudentPerformanceRow[] }>(
    `${API_ENDPOINTS.headteacher.studentPerformance(studentId)}${query}`,
  );
}

export function principalOverview(termId: string) {
  return apiRequest<SchoolOverview>(
    `${API_ENDPOINTS.principal.overview}?termId=${encodeURIComponent(termId)}`,
  );
}

export function principalClassStudents(classId: string, termId: string) {
  return apiRequest<{ students: LeadershipStudentRow[] }>(
    `${API_ENDPOINTS.principal.classStudents(classId)}?termId=${encodeURIComponent(termId)}`,
  );
}

export function promotionsPreview(termId: string) {
  return apiRequest<{ suggestions: PromotionSuggestion[] }>(
    `${API_ENDPOINTS.principal.promotionsPreview}?termId=${encodeURIComponent(termId)}`,
  );
}

export function approvePromotions(payload: {
  termId: string;
  decisions: { studentId: string; decision: "PROMOTE" | "REPEAT"; reason?: string }[];
}) {
  return apiRequest<{ approved: number }>(API_ENDPOINTS.principal.promotionsApprove, {
    method: "POST",
    body: payload,
  });
}

export function lockTerm(termId: string) {
  return apiRequest<{ locked: boolean; lockedAt: string }>(
    API_ENDPOINTS.principal.lockTerm(termId),
    { method: "POST" },
  );
}
