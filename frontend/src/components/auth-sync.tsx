"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

/**
 * AuthSync component - Syncs Clerk user with backend database
 * 
 * This component:
 * 1. Sets the Clerk JWT token to the API client
 * 2. Calls /users/me to create/sync user in backend DB
 * 3. Runs automatically when user signs in
 */
export function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSignedIn) {
      api.setTokenSource(getToken);
    } else {
      api.setTokenSource(async () => null);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) return;

      try {
        // Call /users/me to sync user with backend
        const user = await api.getMe();
        queryClient.setQueryData(["me"], user);
        console.log("[AuthSync] User synced with backend:", user.email);
      } catch (error) {
        console.error("[AuthSync] Failed to sync user with backend:", error);
      }
    };

    syncUser();
  }, [isSignedIn, queryClient]);

  return null;
}

