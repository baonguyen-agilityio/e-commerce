"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useCurrentUser } from "./use-user";

export function useCart() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();

  const query = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.getCart(),
    enabled: !!user,
  });

  return {
    ...query,
    isLoading: isUserLoading || query.isLoading,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, quantity }: { publicId: string; quantity?: number }) =>
      api.addToCart(publicId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, quantity }: { publicId: string; quantity: number }) =>
      api.updateCartItem(publicId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => api.removeFromCart(publicId),
    onSuccess: (updatedCart) => {
      // Update cache with returned cart data instead of refetching
      queryClient.setQueryData(["cart"], updatedCart);
      toast.success("Removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove from cart");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.clearCart(),
    onSuccess: (updatedCart) => {
      // Update cache with returned cart data instead of refetching
      queryClient.setQueryData(["cart"], updatedCart);
    },
  });
}
