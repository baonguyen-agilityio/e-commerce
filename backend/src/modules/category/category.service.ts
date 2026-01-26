import { Repository } from "typeorm";
import {
  CreateCategoryDto,
  ICategoryService,
  UpdateCategoryDto,
} from "./category.interface";
import { Category } from "./entities/Category";
import { BadRequestError, NotFoundError } from "../../shared/errors";
import { PaginatedResult } from "../../shared/interfaces/pagination";
import { ErrorMessages } from "../../shared/errors/messages";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: Repository<Category>) {}

  private async findCategoryOrThrow(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundError(ErrorMessages.CATEGORY_NOT_FOUND);
    }
    return category;
  }

  async getAllCategories(): Promise<PaginatedResult<Category>> {
    const categories = await this.categoryRepository.find();
    return {
      data: categories,
      total: categories.length,
      page: 1,
      limit: categories.length,
      totalPages: 1,
    };
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const category = await this.findCategoryOrThrow(id);
    return category;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    id: number,
    data: UpdateCategoryDto,
  ): Promise<Category | null> {
    const category = await this.findCategoryOrThrow(id);
    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const category = await this.findCategoryOrThrow(id);

    if (category.products && category.products.length > 0) {
      throw new BadRequestError(ErrorMessages.CATEGORY_HAS_PRODUCTS);
    }

    await this.categoryRepository.softRemove(category);
    return true;
  }
}
