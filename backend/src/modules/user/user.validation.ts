import { z } from "zod";
import { UserRole } from "./entities/User";

export const changeRoleSchema = z.object({
    role: z.enum([UserRole.CUSTOMER, UserRole.STAFF, UserRole.ADMIN, UserRole.SUPER_ADMIN], {
        message: "Invalid role. Must be one of: CUSTOMER, STAFF, ADMIN, SUPER_ADMIN",
    }),
});
