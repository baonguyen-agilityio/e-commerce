import { UserRole } from '../../modules/user/entities/User';
import { Request } from 'express';

export interface AuthContext {
    userId: string;
    role: UserRole;
    email?: string;
    name?: string;
}

export function getAuthContext(req: Request): AuthContext {
    const auth = (req as any).auth;

    return {
        userId: auth.userId,
        role: auth.role as UserRole,
        email: auth.sessionClaims?.email as string,
        name: auth.sessionClaims?.name as string,
    };
}
