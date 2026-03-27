import { apiRequest } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  BootstrapRegisterPayload,
  CurrentUserPermissions,
  CurrentUser,
  LoginPayload,
  LoginResponse,
} from "@/types/auth";

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>(API_ENDPOINTS.auth.login, {
    method: "POST",
    body: payload,
  });
}

export function register(payload: BootstrapRegisterPayload) {
  return apiRequest<LoginResponse>(API_ENDPOINTS.auth.register, {
    method: "POST",
    body: payload,
  });
}

export function getCurrentUser() {
  return apiRequest<{
    user: CurrentUser;
    permissions: CurrentUserPermissions;
  }>(API_ENDPOINTS.auth.me).then((response) => ({
    ...response.user,
    permissions: response.permissions,
  }));
}
