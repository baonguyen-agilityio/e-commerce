import { z } from "zod";
import { paginationSchema, searchSchema } from "@/shared/validation/common";

export const orderQuerySchema = paginationSchema.merge(searchSchema);

export const createOrderSchema = z.object({
    paymentMethodId: z.string().min(1, { message: "Payment method is required" })
});