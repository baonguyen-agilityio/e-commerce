import { Request, Response } from "express";
import { IUserService } from "./user.interface";
import { asyncHandler } from "../../shared/middleware/asyncHandler";
import { getAuthContext } from "../../shared/dtos/AuthContext";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const authContext = getAuthContext(req);

    const user = await this.userService.findOrCreate({
      clerkId: authContext.userId,
      email: authContext.email || "",
      name: authContext.name || "",
      role: authContext.role,
    });

    res.json(user);
  });

  getAllUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.userService.getAllUsers({
        page,
        limit,
        search,
      });
      res.json(result);
    },
  );

  changeRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const { role: newRole } = req.body;
      const authContext = getAuthContext(req);

      const user = await this.userService.changeRole({
        newRole,
        targetClerkId: clerkId,
        requestingUserClerkId: authContext.userId,
        requestingUserRole: authContext.role,
      });

      res.json(user);
    },
  );

  deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const authContext = getAuthContext(req);
      await this.userService.deleteUser(clerkId, authContext.role);
      res.json({ message: "User deleted successfully" });
    },
  );

  restoreUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const user = await this.userService.restoreUser(clerkId);
      res.json(user);
    },
  );

  toggleBan = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const authContext = getAuthContext(req);
      const user = await this.userService.toggleBan(clerkId, authContext.role);
      res.json(user);
    },
  );

  toggleLock = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      const authContext = getAuthContext(req);
      const user = await this.userService.toggleLock(clerkId, authContext.role);
      res.json(user);
    },
  );
}
