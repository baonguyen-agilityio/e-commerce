import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../user.service";
import { User, UserRole } from "../entities/User";
import {
  createMockRepository,
  MockRepository,
} from "@/test/mocks/repository.mock";
import { BadRequestError, ForbiddenError } from "@/shared/errors";

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: MockRepository<User>;

  let mockCustomer: Partial<User>;
  let mockAdmin: Partial<User>;
  let mockSuperAdmin: Partial<User>;

  beforeEach(() => {
    mockCustomer = {
      id: 1,
      clerkId: "clerk_customer",
      email: "customer@test.com",
      role: UserRole.CUSTOMER,
      isBanned: false,
      isLocked: false,
      createdAt: new Date("2024-01-01"),
    };

    mockAdmin = {
      id: 2,
      clerkId: "clerk_admin",
      email: "admin@test.com",
      role: UserRole.ADMIN,
      createdAt: new Date("2024-01-02"),
    };

    mockSuperAdmin = {
      id: 3,
      clerkId: "clerk_super",
      email: "super@test.com",
      role: UserRole.SUPER_ADMIN,
      createdAt: new Date("2024-01-03"),
    };

    mockUserRepository = createMockRepository<User>();
    userService = new UserService(mockUserRepository as any);
  });

  describe("findOrCreate", () => {
    it("should return existing user", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await userService.findOrCreate({
        clerkId: "clerk_customer",
        email: "customer@test.com",
        role: UserRole.CUSTOMER,
      });

      expect(result).toEqual(mockCustomer);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("should create new user when not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockCustomer);
      mockUserRepository.save.mockResolvedValue(mockCustomer);

      await userService.findOrCreate({
        clerkId: "clerk_new",
        email: "new@test.com",
        role: UserRole.CUSTOMER,
      });

      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe("changeRole", () => {
    it("should throw BadRequestError when trying to change own role", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_admin",
          requestingUserClerkId: "clerk_admin",
          requestingUserRole: UserRole.ADMIN,
          newRole: UserRole.CUSTOMER,
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw ForbiddenError when trying to demote SUPER_ADMIN", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockSuperAdmin);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_super",
          requestingUserClerkId: "clerk_admin",
          requestingUserRole: UserRole.SUPER_ADMIN,
          newRole: UserRole.ADMIN,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ForbiddenError when non-SUPER_ADMIN tries to promote to ADMIN", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_customer",
          requestingUserClerkId: "clerk_admin",
          requestingUserRole: UserRole.ADMIN,
          newRole: UserRole.ADMIN,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ForbiddenError when trying to promote to SUPER_ADMIN", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_customer",
          requestingUserClerkId: "clerk_super",
          requestingUserRole: UserRole.SUPER_ADMIN,
          newRole: UserRole.SUPER_ADMIN,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should successfully change role when valid", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);
      mockUserRepository.save.mockResolvedValue({
        ...mockCustomer,
        role: UserRole.STAFF,
      });

      const result = await userService.changeRole({
        targetClerkId: "clerk_customer",
        requestingUserClerkId: "clerk_admin",
        requestingUserRole: UserRole.ADMIN,
        newRole: UserRole.STAFF,
      });

      expect(result.role).toBe(UserRole.STAFF);
    });

    it("should throw ForbiddenError when trying to modify user with higher role", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_admin",
          requestingUserClerkId: "clerk_staff",
          requestingUserRole: UserRole.STAFF,
          newRole: UserRole.CUSTOMER,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ForbiddenError when trying to promote user to own role level", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_customer",
          requestingUserClerkId: "clerk_staff",
          requestingUserRole: UserRole.STAFF,
          newRole: UserRole.STAFF,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw BadRequestError when demoting the last admin", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      mockUserRepository.count.mockResolvedValue(1);

      await expect(
        userService.changeRole({
          targetClerkId: "clerk_admin",
          requestingUserClerkId: "clerk_super",
          requestingUserRole: UserRole.SUPER_ADMIN,
          newRole: UserRole.STAFF,
        }),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("getAllUsers", () => {
    it("should return paginated users", async () => {
      const users = [mockSuperAdmin, mockAdmin, mockCustomer];

      const mockQueryBuilder = {
        withDeleted: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getManyAndCount: vi.fn().mockResolvedValue([users, users.length]),
      };

      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await userService.getAllUsers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.data[0].role).toBe(UserRole.SUPER_ADMIN);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);
      mockUserRepository.count.mockResolvedValue(2);
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await userService.deleteUser(
        "clerk_customer",
        UserRole.ADMIN,
      );

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith({
        clerkId: "clerk_customer",
      });
    });

    it("should throw ForbiddenError when trying to delete SUPER_ADMIN", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockSuperAdmin);

      await expect(
        userService.deleteUser("clerk_super", UserRole.ADMIN),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should throw ForbiddenError when trying to delete user with higher/equal role", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        userService.deleteUser("clerk_admin", UserRole.ADMIN),
      ).rejects.toThrow(ForbiddenError);
    });

    it("should allow deleting CUSTOMER even when only 1 admin exists", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCustomer);
      mockUserRepository.count.mockResolvedValue(1);

      const result = await userService.deleteUser(
        "clerk_customer",
        UserRole.ADMIN,
      );
      expect(result).toBe(true);
    });

    it("should throw BadRequestError when deleting the last admin", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);
      mockUserRepository.count.mockResolvedValue(1);

      await expect(
        userService.deleteUser("clerk_admin", UserRole.SUPER_ADMIN),
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("toggleBan", () => {
    it("should ban user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        isBanned: false,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockCustomer,
        isBanned: true,
      });

      const result = await userService.toggleBan(
        "clerk_customer",
        UserRole.ADMIN,
      );

      expect(result.isBanned).toBe(true);
    });

    it("should unban user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        isBanned: true,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockCustomer,
        isBanned: false,
      });

      const result = await userService.toggleBan(
        "clerk_customer",
        UserRole.ADMIN,
      );

      expect(result.isBanned).toBe(false);
    });

    it("should throw ForbiddenError when trying to ban user with higher/equal role", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        userService.toggleBan("clerk_admin", UserRole.ADMIN),
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe("toggleLock", () => {
    it("should lock user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        isLocked: false,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockCustomer,
        isLocked: true,
      });

      const result = await userService.toggleLock(
        "clerk_customer",
        UserRole.ADMIN,
      );

      expect(result.isLocked).toBe(true);
    });

    it("should unlock user successfully", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockCustomer,
        isLocked: true,
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockCustomer,
        isLocked: false,
      });

      const result = await userService.toggleLock(
        "clerk_customer",
        UserRole.ADMIN,
      );

      expect(result.isLocked).toBe(false);
    });

    it("should throw ForbiddenError when trying to lock user with higher/equal role", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        userService.toggleLock("clerk_admin", UserRole.ADMIN),
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
