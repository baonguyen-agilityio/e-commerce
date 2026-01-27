import { Repository } from "typeorm";
import {
  CreateCategoryDto,
  ICategoryService,
  UpdateCategoryDto,
} from "./category.interface";
import { Category } from "./entities/Category";
import { BadRequestError, NotFoundError } from "@/shared/errors";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ErrorMessages } from "@/shared/errors/messages";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: Repository<Category>) { }

  private async findCategoryOrThrow(publicId: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ publicId });
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

  async getCategoryById(publicId: string): Promise<Category | null> {
    const category = await this.findCategoryOrThrow(publicId);
    return category;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    publicId: string,
    data: UpdateCategoryDto,
  ): Promise<Category | null> {
    const category = await this.findCategoryOrThrow(publicId);
    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(publicId: string): Promise<boolean> {
    const category = await this.findCategoryOrThrow(publicId);

    if (category.products && category.products.length > 0) {
      throw new BadRequestError(ErrorMessages.CATEGORY_HAS_PRODUCTS);
    }

    await this.categoryRepository.softRemove(category);
    return true;
  }
}
