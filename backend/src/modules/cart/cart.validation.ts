import z from "zod";

export const addItemToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().optional(),
});

export const updateItemQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});