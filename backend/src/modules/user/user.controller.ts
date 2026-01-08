import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { IUserService } from './user.interface';

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const auth = getAuth(req);

      if (!auth.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const email = (auth.sessionClaims?.email as string) || '';
      const name = (auth.sessionClaims?.name as string) || '';

      const user = await this.userService.findOrCreate({
        clerkId: auth.userId,
        email,
        name,
      });

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}


