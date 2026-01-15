"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { UserRole } from "@/types";

export function useCurrentUser() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      // Lấy token và set trước khi gọi API
      const token = await getToken();
      api.setToken(token);
      return api.getMe();
    },
    enabled: isLoaded && isSignedIn === true,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useUsers() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getAllUsers();
    },
    enabled: isLoaded && isSignedIn === true,
  });
}

export function useChangeRole() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      clerkId,
      role,
    }: {
      clerkId: string;
      role: UserRole;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.changeRole(clerkId, role);
    },
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
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (clerkId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.deleteUser(clerkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

export function useToggleBan() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (clerkId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.toggleBan(clerkId);
    },
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
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (clerkId: string) => {
      const token = await getToken();
      api.setToken(token);
      return api.toggleLock(clerkId);
    },
    onSuccess: ({ isLocked }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(isLocked ? "User locked" : "User unlocked");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update lock status");
    },
  });
}
