import { Router } from 'express';
import { UserController } from './user.controller';
import { requireAuthenticated } from '../../shared/middleware/requireAuth';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/me', requireAuthenticated, controller.getMe);

  return router;
}


