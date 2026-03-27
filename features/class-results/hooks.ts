"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/class-results/api";
import type { UpdateCommentsPayload } from "@/types/class-results";

export function useClassResultsStatusQuery(classId?: string, termId?: string) {
  return useQuery({
    queryKey: ["classResults", "status", classId, termId],
    queryFn: () => api.getClassResultsStatus(classId as string, termId as string),
    enabled: Boolean(classId && termId),
  });
}

export function useClassResultStudentsQuery(classId?: string, termId?: string) {
  return useQuery({
    queryKey: ["classResults", "students", classId, termId],
    queryFn: () => api.getClassResultStudents(classId as string, termId as string),
    enabled: Boolean(classId && termId),
  });
}

export function useBulkReportCardsQuery(classId?: string, termId?: string) {
  return useQuery({
    queryKey: ["classResults", "reportCards", classId, termId],
    queryFn: () => api.getBulkReportCards(classId as string, termId as string),
    enabled: Boolean(classId && termId),
  });
}

export function useSubjectPositionsQuery(classId?: string, termId?: string, subjectId?: string) {
  return useQuery({
    queryKey: ["classResults", "subjectPositions", classId, termId, subjectId],
    queryFn: () => api.getSubjectPositions(classId as string, termId as string, subjectId as string),
    enabled: Boolean(classId && termId && subjectId),
  });
}

export function useReportCardQuery(classId?: string, termId?: string, studentId?: string) {
  return useQuery({
    queryKey: ["classResults", "reportCard", classId, termId, studentId],
    queryFn: () => api.getReportCard(classId as string, termId as string, studentId as string),
    enabled: Boolean(classId && termId && studentId),
  });
}

export function useAggregateClassResultsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, termId }: { classId: string; termId: string }) =>
      api.aggregateClassResults(classId, termId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classResults", "status", variables.classId, variables.termId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classResults", "students", variables.classId, variables.termId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classResults", "reportCards", variables.classId, variables.termId],
      });
    },
  });
}

export function usePatchCommentsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classId,
      termId,
      payload,
    }: {
      classId: string;
      termId: string;
      payload: UpdateCommentsPayload;
    }) => api.patchClassResultComments(classId, termId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["classResults", "students", variables.classId, variables.termId],
      });
      queryClient.invalidateQueries({
        queryKey: ["classResults", "reportCards", variables.classId, variables.termId],
      });
    },
  });
}

export function useDownloadReportCardPdfMutation() {
  return useMutation({
    mutationFn: ({
      classId,
      termId,
      studentId,
    }: {
      classId: string;
      termId: string;
      studentId: string;
    }) => api.downloadReportCardPdf(classId, termId, studentId),
  });
}
