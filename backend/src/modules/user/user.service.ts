import { Repository } from "typeorm";
import { getRoleLevel, User, UserRole } from "./entities/User";
import { IUserService, CreateUserDto, ChangeRoleDto } from "./user.interface";
import { BadRequestError, ForbiddenError, InternalError, NotFoundError } from "../../shared/errors";
import { clerkClient } from "@clerk/express";
import { ErrorMessages } from "../../shared/errors/messages";

export class UserService implements IUserService {
  constructor(private readonly userRepository: Repository<User>) {}

    private async findUserOrThrow(clerkId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }

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

    const targetUser = await this.findUserOrThrow(targetClerkId);

    const currentRole = targetUser.role;

    // Rule 1: Cannot change your own role
    if (targetClerkId === requestingUserClerkId) {
      throw new BadRequestError(ErrorMessages.CANNOT_MODIFY_SELF);
    }

    // Rule 2: SUPER_ADMIN cannot be demoted
    if (currentRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorMessages.SUPER_ADMIN_CANNOT_BE_DEMOTED);
    }

    // Rule 3: Only SUPER_ADMIN can promote to/demote from ADMIN
    if (newRole === UserRole.ADMIN || currentRole === UserRole.ADMIN) {
      if (requestingUserRole !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenError(
          ErrorMessages.ONLY_SUPER_ADMIN_CAN_PROMOTE_TO_OR_DEMOTE_ADMIN,
        );
      }
    }

    // Rule 4: Cannot promote to SUPER_ADMIN
    if (newRole === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorMessages.CANNOT_PROMOTE_TO_SUPER_ADMIN);
    }

    // Rule 5: Can only manage users with lower role level
    if (getRoleLevel(currentRole) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(ErrorMessages.CANNOT_MODIFY_HIGHER_ROLE);
    }

    // Rule 6: Cannot promote user to your own role level or higher
    if (getRoleLevel(newRole) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(ErrorMessages.CANNOT_PROMOTE_TO_HIGHER_ROLE);
    }

    // Rule 7: If demoting the last admin, prevent it
    if (currentRole === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        throw new BadRequestError(
          ErrorMessages.CANNOT_DEMOTE_LAST_ADMIN);
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
    const user = await this.findUserOrThrow(clerkId);
    const adminCount = await this.userRepository.count({
        where: { role: UserRole.ADMIN },
      });
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorMessages.CANNOT_DELETE_SUPER_ADMIN);
    }
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(ErrorMessages.CANNOT_DELETE_USER_WITH_HIGHER_ROLE);
    }
    if(user.role === UserRole.ADMIN && adminCount <= 1) {
      throw new BadRequestError(ErrorMessages.CANNOT_DELETE_LAST_ADMIN);
    }
    const deleteUserClerk = await clerkClient.users.deleteUser(clerkId);
    if (!deleteUserClerk) {
      throw new InternalError(ErrorMessages.FAILED_TO_DELETE_USER_FROM_CLERK);
    }
    await this.userRepository.delete({ clerkId });
    return true;
  }

  async toggleBan(clerkId: string, requestingUserRole: UserRole): Promise<User> {
    const user = await this.findUserOrThrow(clerkId);
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(ErrorMessages.CANNOT_BAN_USER_WITH_HIGHER_ROLE);
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
    const user = await this.findUserOrThrow(clerkId);
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(ErrorMessages.CANNOT_LOCK_USER_WITH_HIGHER_ROLE);
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
