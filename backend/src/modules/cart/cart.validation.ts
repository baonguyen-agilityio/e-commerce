import { z } from "zod";

export const addItemSchema = z.object({
  productId: z.string().uuid({ message: "We couldn't recognize this product's ID" }),
  quantity: z.number().int().min(1, { message: "Please add at least one item" }).default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});