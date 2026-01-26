// User types
export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  STAFF = "staff",
  SUPER_ADMIN = "super_admin",
}

export interface User {
  id: number;
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  isBanned: boolean;
  isLocked: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string | null;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  category?: Category;
  isActive: boolean;
  createdAt: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  categoryId?: number;
  isActive?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  page?: number;
  limit?: number;
}

// Cart types
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  updatedAt: string;
  items: CartItem[];
}

// Order types
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: number;
  userId: number;
  user?: User;
  total: number;
  status: string;
  paymentId: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

// API Response types
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
