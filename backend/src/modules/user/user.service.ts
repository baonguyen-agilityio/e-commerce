import { Repository } from "typeorm";
import { getRoleLevel, User, UserRole } from "./entities/User";
import { IUserService, CreateUserDto, ChangeRoleDto } from "./user.interface";
import { AppError } from "../../shared/middleware/errorHandler";
import { clerkClient } from "@clerk/express";

export class UserService implements IUserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async findOrCreate(data: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { clerkId: data.clerkId },
    });

    if (!user) {
      user = this.userRepository.create({
        clerkId: data.clerkId,
        email: data.email,
        name: data.name || "",
        role: UserRole.CUSTOMER,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.sort((a, b) => {
      const roleDiff = getRoleLevel(b.role) - getRoleLevel(a.role);
      if (roleDiff !== 0) {
        return roleDiff;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  async changeRole(changeRoleDto: ChangeRoleDto): Promise<User> {
    const {
      newRole,
      targetClerkId,
      requestingUserClerkId,
      requestingUserRole,
    } = changeRoleDto;

    const targetUser = await this.userRepository.findOne({
      where: { clerkId: targetClerkId },
    });
    if (!targetUser) {
      throw new AppError(404, "Target user not found");
    }

    const currentRole = targetUser.role;

    // Rule 1: Cannot change your own role
    if (targetClerkId === requestingUserClerkId) {
      throw new AppError(400, "You cannot change your own role");
    }

    // Rule 2: SUPER_ADMIN cannot be demoted
    if (currentRole === UserRole.SUPER_ADMIN) {
      throw new AppError(403, "SUPER_ADMIN role cannot be demoted");
    }

    // Rule 3: Only SUPER_ADMIN can promote to/demote from ADMIN
    if (newRole === UserRole.ADMIN || currentRole === UserRole.ADMIN) {
      if (requestingUserRole !== UserRole.SUPER_ADMIN) {
        throw new AppError(
          403,
          "Only Super Admin can promote to or demote Admin",
        );
      }
    }

    // Rule 4: Cannot promote to SUPER_ADMIN
    if (newRole === UserRole.SUPER_ADMIN) {
      throw new AppError(403, "Cannot promote a user to SUPER_ADMIN");
    }

    // Rule 5: Can only manage users with lower role level
    if (getRoleLevel(currentRole) >= getRoleLevel(requestingUserRole)) {
      throw new AppError(403, "Cannot modify user with equal or higher role");
    }

    // Rule 6: Cannot promote user to your own role level or higher
    if (getRoleLevel(newRole) >= getRoleLevel(requestingUserRole)) {
      throw new AppError(403, "Cannot promote user to your level or higher");
    }

    // Rule 7: If demoting the last admin, prevent it
    if (currentRole === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new AppError(
          400,
          "Cannot demote the last Admin. Promote another user first.",
        );
      }
    }

    targetUser.role = newRole;
    await this.userRepository.save(targetUser);
    await clerkClient.users.updateUserMetadata(targetClerkId, { 
      publicMetadata: { role: newRole },
     });
    return targetUser;
  }

  async deleteUser(clerkId: string, requestingUserRole: UserRole): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError(403, "Cannot delete SUPER_ADMIN");
    }
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new AppError(403, "Cannot delete user with equal or higher role");
    }
    if(adminCount <= 1) {
      throw new AppError(400, "Cannot delete the last Admin. Promote another user first.");
    }
    const deleteUserClerk = await clerkClient.users.deleteUser(clerkId);
    if (!deleteUserClerk) {
      throw new AppError(500, "Failed to delete user from Clerk");
    }
    await this.userRepository.delete({ clerkId });
    return true;
  }

  async toggleBan(clerkId: string, requestingUserRole: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new AppError(403, "Cannot ban user with equal or higher role");
    }
    if (user.isBanned) {
      await clerkClient.users.unbanUser(clerkId);
      user.isBanned = false;
    } else {
      await clerkClient.users.banUser(clerkId);
      user.isBanned = true;
    }
    return this.userRepository.save(user);
  }

  async toggleLock(clerkId: string, requestingUserRole: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new AppError(403, "Cannot lock user with equal or higher role");
    }
    if (user.isLocked) {
      await clerkClient.users.unlockUser(clerkId);
      user.isLocked = false;
    } else {
      await clerkClient.users.lockUser(clerkId);
      user.isLocked = true;
    }
    return this.userRepository.save(user);
  }
}
