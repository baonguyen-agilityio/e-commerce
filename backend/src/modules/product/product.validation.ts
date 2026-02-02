import { paginationSchema, searchSchema } from "@/shared/validation/common";
import { z } from "zod";

const booleanString = z.preprocess((val) => {
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}, z.boolean().optional());

export const productQuerySchema = paginationSchema
  .merge(searchSchema)
  .extend({
    categoryId: z.string().optional(),
    isActive: booleanString,
    inStock: booleanString,
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sort: z.enum(["name", "price", "createdAt"]).default("createdAt"),
    order: z.enum(["ASC", "DESC"]).default("DESC"),
  });

export const createProductSchema = z.object({
  name: z.string().min(1, { message: "Please provide a name for the product" }),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price cannot be negative" }),
  stock: z.number().min(0, { message: "Stock level cannot be negative" }).optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional(),
  categoryId: z.string().optional(), // TODO: validate categoryId
  isActive: z.boolean().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, { message: "Product name cannot be empty" }).optional(),
  description: z.string().optional(),
  price: z.number().min(0, { message: "Price cannot be negative" }).optional(),
  stock: z.number().min(0, { message: "Stock level cannot be negative" }).optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});