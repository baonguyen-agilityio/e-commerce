import { Request, Response, NextFunction } from "express";
import {
  hasPermission,
  UserRole,
} from "@/modules/user/entities/User";
import { getAuth } from "@clerk/express";
import { UnauthorizedError, ForbiddenError } from "../errors";
import { ErrorMessages } from "../errors/messages";

export const requireAuth = (minRole?: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);

      if (!auth.userId) {
        throw new UnauthorizedError(ErrorMessages.AUTH_REQUIRED);
      }

      const metadata = auth.sessionClaims?.publicMetadata as { role?: UserRole } | undefined;
      const role = metadata?.role || UserRole.CUSTOMER;

      req.auth = {
        ...auth,
        userId: auth.userId,
        clerkId: auth.userId,
        role,
        sessionClaims: auth.sessionClaims
      };

      if (minRole) {
        if (!hasPermission(role, minRole)) {
          throw new ForbiddenError(ErrorMessages.INSUFFICIENT_PERMISSIONS);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
