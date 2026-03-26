"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/admin/api";

export function useSessionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "sessions"],
    queryFn: api.listSessions,
    enabled,
  });
}

export function useUsersQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: api.listUsers,
    enabled,
  });
}

export function useUserDetailQuery(userId?: string) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => api.getUserById(userId as string),
    enabled: Boolean(userId),
  });
}

export function useCreateSchoolUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSchoolUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateUser>[1] }) =>
      api.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", variables.id] });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
    },
  });
}

export function useUpdateSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateSession>[1] }) =>
      api.updateSession(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "terms"] });
    },
  });
}

export function useTermsQuery(sessionId?: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "terms", sessionId ?? "all"],
    queryFn: () => api.listTerms(sessionId),
    enabled,
  });
}

export function useCreateTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "terms"] });
    },
  });
}

export function useUpdateTermMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateTerm>[1] }) =>
      api.updateTerm(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "terms"] });
    },
  });
}

export function useClassesQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "classes"],
    queryFn: api.listClasses,
    enabled,
  });
}

export function useCreateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "classes"] });
    },
  });
}

export function useUpdateClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateClass>[1] }) =>
      api.updateClass(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "classes"] });
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "classes"] });
    },
  });
}

export function useSubjectsQuery(enabled = true) {
  return useQuery({
    queryKey: ["admin", "subjects"],
    queryFn: api.listSubjects,
    enabled,
  });
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subjects"] });
    },
  });
}

export function useUpdateSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.updateSubject>[1] }) =>
      api.updateSubject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subjects"] });
    },
  });
}

export function useDeleteSubjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subjects"] });
    },
  });
}

export function useClassCoverageQuery(classId?: string, termId?: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "classCoverage", classId ?? "", termId ?? "all"],
    queryFn: () => api.getClassCoverage(classId as string, termId),
    enabled: enabled && Boolean(classId),
  });
}

export function useCreateTeachingAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createTeachingAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "classCoverage"] });
    },
  });
}

export function useUnassignTeachingAssignmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.unassignTeachingAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "classCoverage"] });
    },
  });
}
