import { Repository } from "typeorm";
import { getRoleLevel, User, UserRole, ROLE_HIERARCHY } from "./entities/User";
import { IUserService, CreateUserDto, ChangeRoleDto } from "./user.interface";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "@/shared/errors";
import { clerkClient } from "@clerk/express";
import { ErrorMessages } from "@/shared/errors/messages";
import { loggers } from "@shared/utils/logger";

export class UserService implements IUserService {
  constructor(private readonly userRepository: Repository<User>) { }

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
        role: data.role,
      });
      await this.userRepository.save(user);

      try {
        await clerkClient.users.updateUserMetadata(data.clerkId, {
          publicMetadata: { role: data.role },
        });
      } catch (error) {
        loggers.error("Failed to sync role to Clerk metadata", error, {
          context: 'UserService',
          userId: data.clerkId,
          role: data.role
        });
      }
    }

    return user;
  }

  async getAllUsers(
    params: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder("user")
      .withDeleted();

    const reversedHierarchy = [...ROLE_HIERARCHY].reverse();
    const caseStatement = reversedHierarchy
      .map((role, index) => `WHEN user.role = '${role}' THEN ${index + 1}`)
      .join(" ");

    queryBuilder
      .addSelect(
        `CASE ${caseStatement} ELSE ${ROLE_HIERARCHY.length + 1} END`,
        "role_priority",
      )
      .orderBy("role_priority", "ASC")
      .addOrderBy("user.createdAt", "DESC")
      .skip(skip)
      .take(limit);

    if (params.search) {
      queryBuilder.andWhere(
        "(user.name ILIKE :search OR user.email ILIKE :search)",
        { search: `%${params.search}%` },
      );
    }

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
        throw new BadRequestError(ErrorMessages.CANNOT_DEMOTE_LAST_ADMIN);
      }
    }

    targetUser.role = newRole;
    await this.userRepository.save(targetUser);
    await clerkClient.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { role: newRole },
    });
    return targetUser;
  }

  async deleteUser(
    clerkId: string,
    requestingUserRole: UserRole,
  ): Promise<boolean> {
    const user = await this.findUserOrThrow(clerkId);
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenError(ErrorMessages.CANNOT_DELETE_SUPER_ADMIN);
    }
    if (getRoleLevel(user.role) >= getRoleLevel(requestingUserRole)) {
      throw new ForbiddenError(
        ErrorMessages.CANNOT_DELETE_USER_WITH_HIGHER_ROLE,
      );
    }
    if (user.role === UserRole.ADMIN && adminCount <= 1) {
      throw new BadRequestError(ErrorMessages.CANNOT_DELETE_LAST_ADMIN);
    }

    await this.userRepository.softRemove(user);
    return true;
  }

  async restoreUser(clerkId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { clerkId },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    if (!user.deletedAt) {
      throw new BadRequestError("User is not deleted");
    }

    return await this.userRepository.recover(user);
  }

  async toggleBan(
    clerkId: string,
    requestingUserRole: UserRole,
  ): Promise<User> {
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

  async toggleLock(
    clerkId: string,
    requestingUserRole: UserRole,
  ): Promise<User> {
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
