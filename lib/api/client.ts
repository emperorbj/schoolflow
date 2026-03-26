"use client";

import { toast } from "sonner";
import { clearToken, getToken } from "@/lib/auth/token";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const TOAST_SUCCESS_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function maybeSuccessToast(method: string | undefined, payload: unknown) {
  const normalizedMethod = (method ?? "GET").toUpperCase();
  if (!TOAST_SUCCESS_METHODS.has(normalizedMethod)) {
    return;
  }

  const body = payload as { message?: string; success?: string } | null;
  if (body?.message) {
    toast.success(body.message);
    return;
  }

  if (body?.success) {
    toast.success(body.success);
    return;
  }

  if (normalizedMethod === "POST") {
    toast.success("Created successfully");
    return;
  }

  if (normalizedMethod === "PATCH") {
    toast.success("Updated successfully");
    return;
  }

  if (normalizedMethod === "DELETE") {
    toast.success("Deleted successfully");
    return;
  }

  toast.success("Saved successfully");
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const token = getToken();
  const headers = new Headers(options.headers ?? {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body),
  });

  let payload: unknown = null;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    payload = await response.json();
  }

  if (!response.ok) {
    const body = payload as { error?: string; message?: string; details?: unknown } | null;
    const message = body?.error ?? body?.message ?? "Request failed";

    if (response.status === 401) {
      clearToken();
    }

    throw new ApiError(message, response.status, body?.details);
  }

  if (response.status === 204) {
    maybeSuccessToast(options.method, null);
    return undefined as T;
  }

  maybeSuccessToast(options.method, payload);
  return payload as T;
}
