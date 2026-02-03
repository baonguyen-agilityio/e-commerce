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
  CategoryQueryParams,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
    if (params?.categoryId)
      searchParams.set("categoryId", params.categoryId);
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

  async getProduct(productId: string): Promise<Product> {
    return this.fetch<Product>(`/products/${productId}`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(productId: string, data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.fetch<void>(`/products/${productId}`, { method: "DELETE" });
  }

  // Categories
  async getCategories(params?: CategoryQueryParams): Promise<PaginatedResult<Category>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<Category>>(
      `/categories${query ? `?${query}` : ""}`,
    );
  }

  async getCategory(categoryId: string): Promise<Category> {
    return this.fetch<Category>(`/categories/${categoryId}`);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(categoryId: string, data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>(`/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.fetch<void>(`/categories/${categoryId}`, { method: "DELETE" });
  }

  // Cart
  async getCart(): Promise<Cart> {
    return this.fetch<Cart>("/cart");
  }

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    return this.fetch<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    return this.fetch<Cart>(`/cart/items/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(cartItemId: string): Promise<Cart> {
    return this.fetch<Cart>(`/cart/items/${cartItemId}`, { method: "DELETE" });
  }

  async clearCart(): Promise<Cart> {
    return this.fetch<Cart>("/cart", { method: "DELETE" });
  }

  // Orders
  async checkout(
    paymentMethodId: string,
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

  async getOrdersByUser(
    params?: OrderQueryParams,
  ): Promise<PaginatedResult<Order>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<Order>>(
      `/orders/me${query ? `?${query}` : ""}`,
    );
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.fetch<Order>(`/orders/${orderId}`);
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
