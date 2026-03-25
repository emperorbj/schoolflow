"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/leadership/api";

export function useHeadteacherOverviewQuery(termId?: string) {
  return useQuery({
    queryKey: ["headteacher", "overview", termId],
    queryFn: () => api.headteacherOverview(termId as string),
    enabled: Boolean(termId),
  });
}

export function useHeadteacherClassesQuery(termId?: string) {
  return useQuery({
    queryKey: ["headteacher", "classes", termId],
    queryFn: () => api.headteacherClasses(termId as string),
    enabled: Boolean(termId),
  });
}

export function useHeadteacherClassStudentsQuery(classId?: string, termId?: string) {
  return useQuery({
    queryKey: ["headteacher", "class-students", classId, termId],
    queryFn: () => api.headteacherClassStudents(classId as string, termId as string),
    enabled: Boolean(classId && termId),
  });
}

export function useHeadteacherStudentPerformanceQuery(studentId?: string, termId?: string) {
  return useQuery({
    queryKey: ["headteacher", "student-performance", studentId, termId],
    queryFn: () => api.headteacherStudentPerformance(studentId as string, termId),
    enabled: Boolean(studentId),
  });
}

export function usePrincipalOverviewQuery(termId?: string) {
  return useQuery({
    queryKey: ["principal", "overview", termId],
    queryFn: () => api.principalOverview(termId as string),
    enabled: Boolean(termId),
  });
}

export function usePrincipalClassStudentsQuery(classId?: string, termId?: string) {
  return useQuery({
    queryKey: ["principal", "class-students", classId, termId],
    queryFn: () => api.principalClassStudents(classId as string, termId as string),
    enabled: Boolean(classId && termId),
  });
}

export function usePromotionsPreviewQuery(termId?: string) {
  return useQuery({
    queryKey: ["principal", "promotions-preview", termId],
    queryFn: () => api.promotionsPreview(termId as string),
    enabled: Boolean(termId),
  });
}

export function useApprovePromotionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.approvePromotions,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["principal", "promotions-preview", variables.termId],
      });
    },
  });
}

export function useLockTermMutation() {
  return useMutation({
    mutationFn: api.lockTerm,
  });
}
