"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getToken, setToken } from "@/lib/auth/token";
import { getCurrentUser, login, register } from "@/features/auth/api";

export function useCurrentUserQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    enabled: Boolean(getToken()),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setToken(response.token);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      setToken(response.token);
    },
  });
}
