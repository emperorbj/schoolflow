import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { CreateMaterialPayload, Material } from "@/types/materials";

export function listMaterials(params: { classId?: string; subjectId?: string }) {
  const query = new URLSearchParams();
  if (params.classId) query.set("classId", params.classId);
  if (params.subjectId) query.set("subjectId", params.subjectId);
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiRequest<{ materials: Material[] }>(`${API_ENDPOINTS.materials.list}${suffix}`);
}

export async function uploadMaterial(payload: CreateMaterialPayload) {
  const formData = new FormData();
  formData.set("file", payload.file);
  formData.set("title", payload.title);
  formData.set("classId", payload.classId);
  formData.set("subjectId", payload.subjectId);

  return apiRequest<{ material: Material; maxUploadMb: number }>(
    API_ENDPOINTS.materials.upload,
    {
      method: "POST",
      body: formData,
    },
  );
}

export function getMaterialSignedUrl(id: string) {
  return apiRequest<{ materialId: string; signedUrl: string; expiresInSeconds: number }>(
    API_ENDPOINTS.materials.signedUrl(id),
  );
}
