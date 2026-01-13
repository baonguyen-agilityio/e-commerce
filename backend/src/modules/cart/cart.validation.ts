import z from "zod";

export const addItemToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().optional(),
});

export const updateItemQuantitySchema = z.object({
  cartItemId: z.number().int().positive(),
  quantity: z.number().int(),
});