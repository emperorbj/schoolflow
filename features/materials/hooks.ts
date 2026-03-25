"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/features/materials/api";

export function useMaterialsQuery(params: { classId?: string; subjectId?: string }) {
  return useQuery({
    queryKey: ["materials", params],
    queryFn: () => api.listMaterials(params),
  });
}

export function useUploadMaterialMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.uploadMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useMaterialSignedUrlMutation() {
  return useMutation({
    mutationFn: api.getMaterialSignedUrl,
  });
}
