import { z } from "zod";
import { paginationSchema, searchSchema } from "@/shared/validation/common";

export const categoryQuerySchema = paginationSchema.merge(searchSchema);

export const createCategorySchema = z.object({
  name: z.string().min(1, { message: "Please enter a category name" }),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});