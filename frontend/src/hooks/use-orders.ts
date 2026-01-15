"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useOrders() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getOrders();
    },
    enabled: isLoaded && isSignedIn === true,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.getOrder(id),
    enabled: !!id,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.checkout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed");
    },
  });
}
