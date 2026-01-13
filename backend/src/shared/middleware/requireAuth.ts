import { Request, Response, NextFunction } from "express";
import { User, UserRole } from "../../modules/user/entities/User";
import { getAuth } from "@clerk/express";
import { AppDataSource } from "../../config/database";

export const requireAuth = (role?: UserRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: { clerkId: auth.userId },
    });

    req.auth = { ...auth, userId: auth.userId, role: user?.role };

    if (!role) {
      next();
      return;
    }

    if (!user || user.role !== role) {
      res.status(403).json({ error: `${role} access required` });
      return;
    }

    next();
  };
};
