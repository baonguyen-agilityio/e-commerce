import { Product } from "./entities/Product";

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
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface IProductService {
  getAllProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>>;
  // getProductById(id: number): Promise<Product | null>;
  // createProduct(data: any): Promise<any>;
  // updateProduct(id: string, data: any): Promise<any>;
  // deleteProduct(id: string): Promise<void>;
}
