import { Brackets, Repository } from "typeorm";
import { BaseRepository } from "@/shared/repositories/BaseRepository";
import { IBaseRepository } from "@/shared/repositories/IBaseRepository";
import { Order } from "./entities/Order";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { OrderQueryParams } from "./order.interface";

/**
 * Order repository interface with domain-specific methods
 */
export interface IOrderRepository extends IBaseRepository<Order> {
    findByOrderId(orderId: string): Promise<Order | null>;
    findByOrderIdOrFail(orderId: string): Promise<Order>;
    findByOrderIdWithItems(orderId: string): Promise<Order | null>;
    findAll(params: OrderQueryParams): Promise<PaginatedResult<Order>>;
    findByUser(userId: number, params: OrderQueryParams): Promise<PaginatedResult<Order>>;
}

/**
 * Order repository implementation
 */
export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
    constructor(repository: Repository<Order>) {
        super(repository);
    }

    protected getEntityName(): string {
        return "Order";
    }

    async findByOrderId(orderId: string): Promise<Order | null> {
        return this.findOne({
            where: { orderId },
            relations: ["items", "items.product", "user"]
        });
    }

    async findByOrderIdOrFail(orderId: string): Promise<Order> {
        return this.findOneOrFail({ where: { orderId } });
    }

    async findByOrderIdWithItems(orderId: string): Promise<Order | null> {
        return this.findOne({
            where: { orderId },
            relations: ["items", "items.product"]
        });
    }

    async findAll(params: OrderQueryParams = {}): Promise<PaginatedResult<Order>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.createQueryBuilder("order")
            .leftJoinAndSelect("order.items", "items")
            .leftJoinAndSelect("items.product", "product")
            .leftJoinAndSelect("order.user", "user")
            .orderBy("order.createdAt", "DESC")
            .skip(skip)
            .take(limit);

        if (params.search) {
            queryBuilder.andWhere(new Brackets(qb => {
                qb.where("order.orderId ILIKE :search", { search: `%${params.search}%` })
                    .orWhere("user.name ILIKE :search", { search: `%${params.search}%` })
                    .orWhere("user.email ILIKE :search", { search: `%${params.search}%` });
            }));
        }

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByUser(userId: number, params: OrderQueryParams = {}): Promise<PaginatedResult<Order>> {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await this.repository.findAndCount({
            where: { user: { id: userId } },
            relations: ["items", "items.product"],
            order: { createdAt: "DESC" },
            skip,
            take: limit
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
