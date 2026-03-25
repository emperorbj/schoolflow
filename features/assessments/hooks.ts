"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/assessments/api";
import type { GetScoreSheetQuery, SubmissionStatusQuery } from "@/types/assessments";

export function useTeachingContextsQuery(enabled = true) {
  return useQuery({
    queryKey: ["assessments", "teaching-contexts"],
    queryFn: api.listTeachingContexts,
    enabled,
  });
}

export function useScoreSheetQuery(params: GetScoreSheetQuery | null, enabled = true) {
  return useQuery({
    queryKey: ["scoreSheets", params?.classId, params?.subjectId, params?.termId],
    queryFn: () => api.getScoreSheet(params as GetScoreSheetQuery),
    enabled:
      enabled &&
      Boolean(params?.classId) &&
      Boolean(params?.subjectId) &&
      Boolean(params?.termId),
  });
}

export function usePutScoreSheetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.putScoreSheet,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["scoreSheets", variables.classId, variables.subjectId, variables.termId],
      });
    },
  });
}

export function useSubmitScoresMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitScores,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["scoreSheets", variables.classId, variables.subjectId, variables.termId],
      });
    },
  });
}

export function useSubmissionStatusQuery(params: SubmissionStatusQuery | null, enabled = true) {
  return useQuery({
    queryKey: ["assessments", "submission-status", params?.classId, params?.termId],
    queryFn: () => api.submissionStatus(params as SubmissionStatusQuery),
    enabled: enabled && Boolean(params?.classId) && Boolean(params?.termId),
  });
}
