import { PaginatedResult } from "@/shared/interfaces/pagination";
import { Product } from "./entities/Product";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  imageUrl?: string;
  categoryPublicId: string;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryPublicId?: string;
  isActive?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  categoryPublicId?: string;
  isActive?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'name' | 'price' | 'createdAt';
  order?: 'ASC' | 'DESC';
}
export interface IProductService {
  getAllProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>>;
  getProductByPublicId(publicId: string): Promise<Product | null>;
  createProduct(data: CreateProductDto): Promise<any>;
  updateProduct(publicId: string, data: UpdateProductDto): Promise<Product | null>;
  deleteProduct(publicId: string): Promise<boolean>;
}
