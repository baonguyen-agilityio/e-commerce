"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCurrentUser } from "./use-user";

export function useOrders() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.getOrders(),
    enabled: !!user,
  });

  return {
    ...query,
    isLoading: isUserLoading || query.isLoading,
  };
}

export function useOrdersByUser() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const query = useQuery({
    queryKey: ["orders-by-user"],
    queryFn: () => api.getOrdersByUser(),
    enabled: !!user,
  });

  return {
    ...query,
    isLoading: isUserLoading || query.isLoading,
  };
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
      queryClient.invalidateQueries({ queryKey: ["orders-by-user"] });
      toast.success("Order placed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Checkout failed");
    },
  });
}
