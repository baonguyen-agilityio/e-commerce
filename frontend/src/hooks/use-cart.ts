"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function useCart() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.getCart();
    },
    enabled: isLoaded && isSignedIn === true,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity?: number;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.addToCart(productId, quantity);
    },
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
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      const token = await getToken();
      api.setToken(token);
      return api.updateCartItem(itemId, quantity);
    },
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
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const token = await getToken();
      api.setToken(token);
      return api.removeFromCart(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove from cart");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      api.setToken(token);
      return api.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
