"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/students/api";
import type { ListStudentsQuery } from "@/types/students";

export function useStudentsQuery(params: ListStudentsQuery, enabled = true) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => api.listStudents(params),
    enabled,
  });
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof api.updateStudent>[1];
    }) => api.updateStudent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useStudentMeResultsQuery(termId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["students", "me", "results", termId],
    queryFn: () => api.getStudentMeResults(termId as string),
    enabled: enabled && Boolean(termId),
  });
}
