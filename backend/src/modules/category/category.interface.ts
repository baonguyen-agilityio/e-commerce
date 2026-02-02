import { PaginatedResult } from "@/shared/interfaces/pagination";
import { Category } from "./entities/Category";

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ICategoryService {
  getAllCategories(params?: CategoryQueryParams): Promise<PaginatedResult<Category>>;
  getCategoryById(categoryId: string): Promise<Category | null>;
  createCategory(data: CreateCategoryDto): Promise<Category>;
  updateCategory(
    categoryId: string,
    data: Partial<UpdateCategoryDto>,
  ): Promise<Category>;
  deleteCategory(categoryId: string): Promise<boolean>;
}
