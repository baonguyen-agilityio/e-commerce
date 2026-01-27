import type {
  Product,
  Category,
  Cart,
  Order,
  User,
  PaginatedResult,
  ProductQueryParams,
  OrderQueryParams,
  UserQueryParams,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiClient {
  private getTokenFn: (() => Promise<string | null>) | null = null;

  setTokenSource(fn: () => Promise<string | null>) {
    this.getTokenFn = fn;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.getTokenFn) {
      const token = await this.getTokenFn();
      if (token) {
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !isRetry && this.getTokenFn) {
      // Token might be expired, try to get a fresh one and retry once
      return this.fetch<T>(endpoint, options, true);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Products
  async getProducts(
    params?: ProductQueryParams,
  ): Promise<PaginatedResult<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.categoryPublicId)
      searchParams.set("categoryPublicId", params.categoryPublicId);
    if (params?.isActive !== undefined)
      searchParams.set("isActive", params.isActive.toString());
    if (params?.inStock !== undefined)
      searchParams.set("inStock", params.inStock.toString());
    if (params?.minPrice)
      searchParams.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      searchParams.set("maxPrice", params.maxPrice.toString());
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<Product>>(
      `/products${query ? `?${query}` : ""}`,
    );
  }

  async getProduct(publicId: string): Promise<Product> {
    return this.fetch<Product>(`/products/${publicId}`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(publicId: string, data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>(`/products/${publicId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(publicId: string): Promise<void> {
    await this.fetch<void>(`/products/${publicId}`, { method: "DELETE" });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const result = await this.fetch<PaginatedResult<Category> | Category[]>(
      "/categories",
    );
    if (Array.isArray(result)) {
      return result;
    }
    return result.data;
  }

  async getCategory(publicId: string): Promise<Category> {
    return this.fetch<Category>(`/categories/${publicId}`);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(publicId: string, data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>(`/categories/${publicId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(publicId: string): Promise<void> {
    await this.fetch<void>(`/categories/${publicId}`, { method: "DELETE" });
  }

  // Cart
  async getCart(): Promise<Cart> {
    return this.fetch<Cart>("/cart");
  }

  async addToCart(publicId: string, quantity: number = 1): Promise<Cart> {
    return this.fetch<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ publicId, quantity }),
    });
  }

  async updateCartItem(publicId: string, quantity: number): Promise<Cart> {
    return this.fetch<Cart>(`/cart/items/${publicId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(publicId: string): Promise<Cart> {
    return this.fetch<Cart>(`/cart/items/${publicId}`, { method: "DELETE" });
  }

  async clearCart(): Promise<Cart> {
    return this.fetch<Cart>("/cart", { method: "DELETE" });
  }

  // Orders
  async checkout(
    paymentMethodId?: string,
  ): Promise<{ order: Order; success: boolean }> {
    return this.fetch<{ order: Order; success: boolean }>("/orders", {
      method: "POST",
      body: JSON.stringify({ paymentMethodId }),
    });
  }

  async getOrders(params?: OrderQueryParams): Promise<PaginatedResult<Order>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<Order>>(
      `/orders${query ? `?${query}` : ""}`,
    );
  }

  async getOrdersByUser(): Promise<Order[]> {
    return this.fetch<Order[]>(`/orders/me`);
  }

  async getOrder(publicId: string): Promise<Order> {
    return this.fetch<Order>(`/orders/${publicId}`);
  }

  // Users
  async getMe(): Promise<User> {
    return this.fetch<User>("/users/me");
  }

  async getAllUsers(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<User>>(
      `/users${query ? `?${query}` : ""}`,
    );
  }

  async changeRole(clerkId: string, role: string): Promise<User> {
    return this.fetch<User>(`/users/change-role/${clerkId}`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(clerkId: string): Promise<void> {
    await this.fetch<void>(`/users/${clerkId}`, { method: "DELETE" });
  }

  async restoreUser(clerkId: string): Promise<User> {
    return this.fetch<User>(`/users/restore/${clerkId}`, { method: "POST" });
  }

  async toggleBan(clerkId: string): Promise<User> {
    return this.fetch<User>(`/users/ban/${clerkId}`, { method: "POST" });
  }

  async toggleLock(clerkId: string): Promise<User> {
    return this.fetch<User>(`/users/lock/${clerkId}`, { method: "POST" });
  }
}

export const api = new ApiClient();
