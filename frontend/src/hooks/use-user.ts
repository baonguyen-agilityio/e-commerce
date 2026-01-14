"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
  });
}

export function useSetAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkId: string) => api.setAdmin(clerkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User promoted to admin");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to promote user");
    },
  });
}

