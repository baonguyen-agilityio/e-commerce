import { z } from "zod";

export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1, { message: "Page must be at least 1" })
        .default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, { message: "Limit must be at least 1" })
        .default(10),
});

export const searchSchema = z.object({
    search: z.string().optional(),
});
