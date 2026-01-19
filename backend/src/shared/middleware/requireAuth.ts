import { Request, Response, NextFunction } from "express";
import {
  hasPermission,
  User,
  UserRole,
} from "../../modules/user/entities/User";
import { getAuth } from "@clerk/express";
import { AppDataSource } from "../../config/database";
import { UnauthorizedError, ForbiddenError } from "../errors";

export const requireAuth = (minRole?: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);

      if (!auth.userId) {
        throw new UnauthorizedError("Authentication required");
      }

      const user = await AppDataSource.getRepository(User).findOne({
        where: { clerkId: auth.userId },
      });

      req.auth = { ...auth, clerkId: auth.userId, role: user?.role };

      if (minRole) {
        if (!user || !hasPermission(user.role, minRole)) {
          throw new ForbiddenError(`${minRole} or higher access required`);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
