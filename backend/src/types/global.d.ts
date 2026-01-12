import { SessionAuthObject } from "@clerk/express";
import { UserRole } from "../modules/user/entities/User";

declare global {
  namespace Express {
    interface Request {
      auth?: SessionAuthObject & {
        role?: string;
      };
    }
  }
}

export {};
