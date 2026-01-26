"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCurrentUser } from "./use-user";
import { OrderQueryParams, PaginatedResult, Order } from "@/types";

export function useOrders(params?: OrderQueryParams, options?: object) {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const query = useQuery<PaginatedResult<Order>>({
    queryKey: ["orders", params],
    queryFn: () => api.getOrders(params),
    enabled: !!user,
    ...options,
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
  const router = useRouter();

  return useMutation({
    mutationFn: (paymentMethodId?: string) => api.checkout(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders-by-user"] });
      toast.success("Order placed successfully!");
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.error(error.message || "Checkout failed");
    },
  });
}
