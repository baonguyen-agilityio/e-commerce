import {
  CreateCategoryDto,
  ICategoryService,
  UpdateCategoryDto,
  CategoryQueryParams,
} from "./category.interface";
import { Category } from "./entities/Category";
import { BadRequestError } from "@/shared/errors";
import { PaginatedResult } from "@/shared/interfaces/pagination";
import { ErrorMessages } from "@/shared/errors/messages";
import { ICategoryRepository } from "./category.repository";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: ICategoryRepository) { }

  async getAllCategories(
    params: CategoryQueryParams = {},
  ): Promise<PaginatedResult<Category>> {
    return this.categoryRepository.findAll(params);
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    return this.categoryRepository.findByCategoryIdOrFail(categoryId);
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    categoryId: string,
    data: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findByCategoryIdOrFail(
      categoryId,
    );
    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const category = await this.categoryRepository.findByCategoryIdOrFail(
      categoryId,
    );

    if (await this.categoryRepository.hasProducts(categoryId)) {
      throw new BadRequestError(ErrorMessages.CATEGORY_HAS_PRODUCTS);
    }

    await this.categoryRepository.softRemove(category);
    return true;
  }
}
