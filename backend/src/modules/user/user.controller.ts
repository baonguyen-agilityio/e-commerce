import { Request, Response } from "express";
import { IUserService } from "./user.interface";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { UserRole } from "./entities/User";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const auth = req.auth!;

    if (!auth.userId) {
      return;
    }

    const email = (auth.sessionClaims.email as string) || "";
    const name = (auth.sessionClaims.name as string) || "";

    const user = await this.userService.findOrCreate({
      clerkId: auth.userId,
      email,
      name,
    });

    res.json(user);
  });

  getAllUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const users = await this.userService.getAllUsers();
      res.json(users);
    },
  );

  changeRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const { role: newRole } = req.body;
      const auth = req.auth!;

      if (!clerkId) {
        res.status(400).json({ error: "clerkId parameter is required" });
        return;
      }

      if (!newRole || !Object.values(UserRole).includes(newRole)) {
        res.status(400).json({ error: "Valid role is required" });
        return;
      }

      const user = await this.userService.changeRole({
        newRole,
        targetClerkId: clerkId,
        requestingUserClerkId: auth.userId!,
        requestingUserRole: auth.role as UserRole,
      });

      res.json(user);
    },
  );

  deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const auth = req.auth!;
      await this.userService.deleteUser(clerkId, auth.role as UserRole);
      res.json({ message: "User deleted successfully" });
    },
  );

  toggleBan = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const auth = req.auth!;
      const user = await this.userService.toggleBan(clerkId, auth.role as UserRole);
      res.json(user);
    },
  );

  toggleLock = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const auth = req.auth!;
      const user = await this.userService.toggleLock(clerkId, auth.role as UserRole);
      res.json(user);
    },
  );
}
