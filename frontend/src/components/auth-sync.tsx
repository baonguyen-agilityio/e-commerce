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
    // 1. Always set token source first
    if (isSignedIn) {
      api.setTokenSource(getToken);
    } else {
      api.setTokenSource(async () => null);
      queryClient.setQueryData(["me"], null); // Clear user data on sign out
      return; // Stop here if not signed in
    }

    // 2. Then sync user with backend
    const syncUser = async () => {
      try {
        console.log("[AuthSync] Syncing user with backend...");
        // Ensure token is ready before calling API
        const token = await getToken();
        if (!token) {
          console.warn("[AuthSync] No token available yet");
          return;
        }

        const user = await api.getMe();
        queryClient.setQueryData(["me"], user);
        console.log("[AuthSync] User synced successfully:", user.email);
      } catch (error) {
        console.error("[AuthSync] Failed to sync user:", error);
        // If 401, it might be because the token wasn't ready or user doesn't exist yet
        // The api client handles retries, so we just log here
      }
    };

    syncUser();
  }, [isSignedIn, getToken, queryClient]);

  return null;
}

