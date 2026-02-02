import { Repository } from "typeorm";
import {
  CreateCategoryDto,
  ICategoryService,
  UpdateCategoryDto,
  CategoryQueryParams,
} from "./category.interface";
import { Category } from "./entities/Category";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ErrorMessages } from "@/shared/errors/messages";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: Repository<Category>) { }

  private async findCategoryOrThrow(categoryId: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ categoryId });
    if (!category) {
      throw new NotFoundError(ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return category;
  }

  async getAllCategories(params: CategoryQueryParams = {}): Promise<PaginatedResult<Category>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.categoryRepository.createQueryBuilder("category");

    if (params.search) {
      queryBuilder.where(
        "(category.name ILIKE :search OR category.description ILIKE :search)",
        { search: `%${params.search}%` }
      );
    }

    queryBuilder.orderBy("category.name", "ASC").skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    const category = await this.findCategoryOrThrow(categoryId);
    return category;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    categoryId: string,
    data: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findCategoryOrThrow(categoryId);
    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const category = await this.findCategoryOrThrow(categoryId);

    if (category.products && category.products.length > 0) {
      throw new BadRequestError(ErrorMessages.CATEGORY_HAS_PRODUCTS);
    }

    await this.categoryRepository.softRemove(category);
    return true;
  }
}
