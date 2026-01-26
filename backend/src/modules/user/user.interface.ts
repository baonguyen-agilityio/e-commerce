import { User, UserRole } from "./entities/User";

export interface CreateUserDto {
  clerkId: string;
  email: string;
  name?: string;
  role: UserRole;
}

export interface ChangeRoleDto {
  newRole: UserRole;
  targetClerkId: string;
  requestingUserClerkId: string;
  requestingUserRole: UserRole;
}

export interface IUserService {
  findOrCreate(data: CreateUserDto): Promise<User>;
  getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  changeRole(changeRoleDto: ChangeRoleDto): Promise<User>;
  deleteUser(clerkId: string, requestingUserRole: UserRole): Promise<boolean>;
  restoreUser(clerkId: string): Promise<User>;
  toggleBan(clerkId: string, requestingUserRole: UserRole): Promise<User>;
  toggleLock(clerkId: string, requestingUserRole: UserRole): Promise<User>;
}
