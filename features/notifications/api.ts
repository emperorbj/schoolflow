import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { LowPerformanceAlertPayload, ResultReleasedPayload } from "@/types/notifications";

export function sendResultsReleased(payload: ResultReleasedPayload) {
  return apiRequest<{ sent: number }>(API_ENDPOINTS.notifications.resultsReleased, {
    method: "POST",
    body: payload,
  });
}

export function sendLowPerformanceAlert(payload: LowPerformanceAlertPayload) {
  return apiRequest<{ sent: number; flagged: { classId: string; average: number }[] }>(
    API_ENDPOINTS.notifications.lowPerformanceAlert,
    {
      method: "POST",
      body: payload,
    },
  );
}
