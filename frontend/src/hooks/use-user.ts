"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserRole } from "@/types";
import { useAuth } from "@clerk/nextjs";

export function useCurrentUser() {
  const { isLoaded, isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => api.getMe(),
    enabled: isLoaded && isSignedIn!, // Only fetch if Clerk is loaded and user is signed in
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    ...query,
    // Loading if: Clerk is loading OR (we are signed in AND query is loading)
    isLoading: !isLoaded || (isSignedIn && query.isLoading),
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.getAllUsers(),
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clerkId, role }: { clerkId: string; role: UserRole }) =>
      api.changeRole(clerkId, role),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User role changed to ${user.role}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change role");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkId: string) => api.deleteUser(clerkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkId: string) => api.restoreUser(clerkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User restored successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore user");
    },
  });
}

export function useToggleBan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkId: string) => api.toggleBan(clerkId),
    onSuccess: ({ isBanned }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isBanned ? "User banned" : "User unbanned");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ban status");
    },
  });
}

export function useToggleLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clerkId: string) => api.toggleLock(clerkId),
    onSuccess: ({ isLocked }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isLocked ? "User locked" : "User unlocked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lock status");
    },
  });
}
