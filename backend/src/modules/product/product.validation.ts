import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number").optional(),
  imageUrl: z.string().url("Invalid URL format").optional(),
  categoryId: z.number().int("Category ID must be an integer"),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number").optional(),
  stock: z.number().min(0, "Stock must be a positive number").optional(),
  imageUrl: z.string().url("Invalid URL format").optional(),
  categoryId: z.number().int("Category ID must be an integer").optional(),
  isActive: z.boolean().optional(),
});