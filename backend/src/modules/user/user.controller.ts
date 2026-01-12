import { Request, Response } from "express";
import { IUserService } from "./user.interface";
import { asyncHandler } from "../../shared/middleware/asyncHandler";

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

  setAdmin = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { clerkId } = req.params;
      if (!clerkId) {
        res.status(400).json({ error: "clerkId parameter is required" });
        return;
      }
      const user = await this.userService.setAdmin(clerkId);
      res.json(user);
    },
  );
}
