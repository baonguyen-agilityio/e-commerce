import { PaginatedResult } from "../../shared/interfaces/pagination";
import { Product } from "./entities/Product";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  categoryId: number;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: number;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price' | 'createdAt';
  order?: 'ASC' | 'DESC';
}
export interface IProductService {
  getAllProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>>;
  getProductById(id: number): Promise<Product | null>;
  createProduct(data: CreateProductDto): Promise<any>;
  updateProduct(id: number, data: UpdateProductDto): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;
}
