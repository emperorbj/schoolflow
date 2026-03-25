import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  GetScoreSheetQuery,
  PutScoreSheetPayload,
  ScoreSheetRow,
  SubmissionStatusItem,
  SubmissionStatusQuery,
  SubmitScoresPayload,
  TeachingContext,
} from "@/types/assessments";

type ContextsResponse = { contexts: TeachingContext[] };
type ScoreSheetResponse = { rows: ScoreSheetRow[] };
type SaveScoresResponse = { updated: number };
type SubmitScoresResponse = { lockedRows: number };
type SubmissionStatusResponse = { subjects: SubmissionStatusItem[] };

function scoreSheetQuery(params: GetScoreSheetQuery) {
  return `?classId=${encodeURIComponent(params.classId)}&subjectId=${encodeURIComponent(
    params.subjectId,
  )}&termId=${encodeURIComponent(params.termId)}`;
}

function statusQuery(params: SubmissionStatusQuery) {
  return `?classId=${encodeURIComponent(params.classId)}&termId=${encodeURIComponent(
    params.termId,
  )}`;
}

export function listTeachingContexts() {
  return apiRequest<ContextsResponse>(API_ENDPOINTS.assessments.teachingContexts);
}

export function getScoreSheet(params: GetScoreSheetQuery) {
  return apiRequest<ScoreSheetResponse>(
    `${API_ENDPOINTS.assessments.scoreSheets}${scoreSheetQuery(params)}`,
  );
}

export function putScoreSheet(payload: PutScoreSheetPayload) {
  return apiRequest<SaveScoresResponse>(API_ENDPOINTS.assessments.scoreSheets, {
    method: "PUT",
    body: payload,
  });
}

export function submitScores(payload: SubmitScoresPayload) {
  return apiRequest<SubmitScoresResponse>(API_ENDPOINTS.assessments.submissions, {
    method: "POST",
    body: payload,
  });
}

export function submissionStatus(params: SubmissionStatusQuery) {
  return apiRequest<SubmissionStatusResponse>(
    `${API_ENDPOINTS.assessments.submissionStatus}${statusQuery(params)}`,
  );
}
