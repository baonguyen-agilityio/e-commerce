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
    const syncUser = async () => {
      if (!isSignedIn) {
        api.setToken(null);
        return;
      }

      try {
        // 1. Get and set the Clerk token
        const token = await getToken();
        api.setToken(token);

        // 2. Call /users/me to sync user with backend
        // This creates the user in DB if they don't exist
        const user = await api.getMe();
        
        // 3. Cache the user data
        queryClient.setQueryData(["me"], user);
        
        console.log("[AuthSync] User synced with backend:", user.email);
      } catch (error) {
        console.error("[AuthSync] Failed to sync user with backend:", error);
      }
    };

    syncUser();
  }, [isSignedIn, getToken, queryClient]);

  // Refresh token periodically (Clerk tokens expire)
  useEffect(() => {
    if (!isSignedIn) return;

    const refreshToken = async () => {
      const token = await getToken();
      api.setToken(token);
    };

    // Refresh every 50 seconds (tokens typically expire in 60s)
    const interval = setInterval(refreshToken, 50 * 1000);
    
    return () => clearInterval(interval);
  }, [isSignedIn, getToken]);

  return null;
}

