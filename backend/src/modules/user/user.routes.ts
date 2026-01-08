import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { UserController } from './user.controller';

export function createUserRoutes(controller: UserController): Router {
  const router = Router();

  router.get('/me', requireAuth(), controller.getMe);

  return router;
}


