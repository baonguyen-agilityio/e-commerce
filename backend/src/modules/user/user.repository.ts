import { Repository } from "typeorm";
import { BaseRepository } from "@/shared/repositories/BaseRepository";
import { IBaseRepository } from "@/shared/repositories/IBaseRepository";
import { User, UserRole } from "./entities/User";

/**
 * User repository interface with domain-specific methods
 */
export interface IUserRepository extends IBaseRepository<User> {
    findByClerkId(clerkId: string): Promise<User | null>;
    findByClerkIdOrFail(clerkId: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    countByRole(role: UserRole): Promise<number>;
    findAllWithDeleted(options?: {
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
}

/**
 * User repository implementation
 */
export class UserRepository
    extends BaseRepository<User>
    implements IUserRepository {
    constructor(repository: Repository<User>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "User";
    }

    async findByClerkId(clerkId: string): Promise<User | null> {
        return this.findOne({ where: { clerkId } });
    }

    async findByClerkIdOrFail(clerkId: string): Promise<User> {
        return this.findOneOrFail({ where: { clerkId } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }

    async countByRole(role: UserRole): Promise<number> {
        return this.count({ role });
    }

    async findAllWithDeleted(
        options: {
            page?: number;
            limit?: number;
            search?: string;
        } = {}
    ): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.createQueryBuilder("user").withDeleted();

        // Add role-based sorting using CASE statement
        const ROLE_HIERARCHY = [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.STAFF,
            UserRole.CUSTOMER,
        ];
        const reversedHierarchy = [...ROLE_HIERARCHY].reverse();
        const caseStatement = reversedHierarchy
            .map((role, index) => `WHEN user.role = '${role}' THEN ${index + 1}`)
            .join(" ");

        queryBuilder
            .addSelect(
                `CASE ${caseStatement} ELSE ${ROLE_HIERARCHY.length + 1} END`,
                "role_priority"
            )
            .orderBy("role_priority", "ASC")
            .addOrderBy("user.createdAt", "DESC")
            .skip(skip)
            .take(limit);

        if (options.search) {
            queryBuilder.andWhere(
                "(user.name ILIKE :search OR user.email ILIKE :search)",
                { search: `%${options.search}%` }
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
}
