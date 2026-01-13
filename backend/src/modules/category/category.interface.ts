import { PaginatedResult } from "../../shared/interfaces/pagination";
import { Category } from "./entities/Category";

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface ICategoryService {
  getAllCategories(): Promise<PaginatedResult<Category>>;
  getCategoryById(id: number): Promise<Category | null>;
  createCategory(data: CreateCategoryDto): Promise<Category>;
  updateCategory(
    id: number,
    data: Partial<UpdateCategoryDto>,
  ): Promise<Category | null>;
    deleteCategory(id: number): Promise<boolean>;
}
