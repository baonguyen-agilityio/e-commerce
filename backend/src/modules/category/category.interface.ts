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

export interface ICategoryService {
  getAllCategories(): Promise<PaginatedResult<Category>>;
  getCategoryById(publicId: string): Promise<Category | null>;
  createCategory(data: CreateCategoryDto): Promise<Category>;
  updateCategory(
    publicId: string,
    data: Partial<UpdateCategoryDto>,
  ): Promise<Category | null>;
  deleteCategory(publicId: string): Promise<boolean>;
}
