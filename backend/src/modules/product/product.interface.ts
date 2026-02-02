import { PaginatedResult } from "@/shared/interfaces/pagination";
import { Product } from "./entities/Product";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  categoryId: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryId?: string;
  isActive?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price' | 'createdAt';
  order?: 'ASC' | 'DESC';
}

export interface IProductService {
  getAllProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>>;
  getProductByProductId(productId: string): Promise<Product | null>;
  createProduct(data: CreateProductDto): Promise<any>;
  updateProduct(productId: string, data: UpdateProductDto): Promise<Product | null>;
  deleteProduct(productId: string): Promise<boolean>;
}
