import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  categoryId: z.number().positive("Category is required"),
  isActive: z.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
});

export const addToCartSchema = z.object({
  productId: z.number().positive(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
