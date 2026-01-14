import { Repository } from "typeorm";
import {
  CreateCategoryDto,
  ICategoryService,
  UpdateCategoryDto,
} from "./category.interface";
import { Category } from "./entities/Category";
import { AppError } from "../../shared/middleware/errorHandler";
import { PaginatedResult } from "../../shared/interfaces/pagination";

export class CategoryService implements ICategoryService {
  constructor(private readonly categoryRepository: Repository<Category>) {}

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
    const existingCategory = await this.categoryRepository.findOneBy({ id });
    if (!existingCategory) {
      throw new AppError(404, "Category not found");
    }
    return existingCategory;
  }

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(data);
    return this.categoryRepository.save(newCategory);
  }

  async updateCategory(
    id: number,
    data: UpdateCategoryDto,
  ): Promise<Category | null> {
    const existingCategory = await this.categoryRepository.findOneBy({ id });
    if (!existingCategory) {
      throw new AppError(404, "Category not found");
    }
    Object.assign(existingCategory, data);
    return this.categoryRepository.save(existingCategory);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: ["products"],
    });

    if (!existingCategory) {
      throw new AppError(404, "Category not found");
    }

    if (existingCategory.products && existingCategory.products.length > 0) {
      throw new AppError(400, `Cannot delete category. It has ${existingCategory.products.length} associated product(s). Please remove or reassign the products first.`);
    }
    
    await this.categoryRepository.delete(id);
    return true;
  }
}
