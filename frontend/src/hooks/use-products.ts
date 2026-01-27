"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Product, ProductQueryParams, PaginatedResult } from "@/types";
import { toast } from "sonner";

export function useProducts(params?: ProductQueryParams, options?: object) {
  return useQuery<PaginatedResult<Product>>({
    queryKey: ["products", params],
    queryFn: () => api.getProducts(params),
    ...options,
  });
}

export function useProduct(publicId: string) {
  return useQuery<Product>({
    queryKey: ["product", publicId],
    queryFn: () => api.getProduct(publicId),
    enabled: !!publicId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Product>) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: Partial<Product> }) =>
      api.updateProduct(publicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.publicId] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => api.deleteProduct(publicId),
    onSuccess: (_, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", publicId] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

