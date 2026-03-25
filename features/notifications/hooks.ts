"use client";

import { useMutation } from "@tanstack/react-query";
import * as api from "@/features/notifications/api";

export function useSendResultsReleasedMutation() {
  return useMutation({
    mutationFn: api.sendResultsReleased,
  });
}

export function useSendLowPerformanceAlertMutation() {
  return useMutation({
    mutationFn: api.sendLowPerformanceAlert,
  });
}
