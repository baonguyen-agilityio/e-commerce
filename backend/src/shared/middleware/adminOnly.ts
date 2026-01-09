import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { AppDataSource } from '../../config/database';
import { User, UserRole } from '../../modules/user/entities/User';

export const adminOnly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { clerkId: auth.userId! },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};