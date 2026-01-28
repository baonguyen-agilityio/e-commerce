import { z } from "zod";
import { UserRole } from "./entities/User";
import { paginationSchema, searchSchema } from "@/shared/validation/common";

export const userQuerySchema = paginationSchema.merge(searchSchema)

export const changeRoleSchema = z.object({
    role: z.enum([UserRole.CUSTOMER, UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN], {
        message: "Please select a valid user role (Customer, Staff, Admin, or Super Admin)",
    }),
});
