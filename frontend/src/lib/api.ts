import type {
  Product,
  Category,
  Cart,
  Order,
  User,
  PaginatedResult,
  ProductQueryParams,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Products
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.minPrice) searchParams.set("minPrice", params.minPrice.toString());
    if (params?.maxPrice) searchParams.set("maxPrice", params.maxPrice.toString());
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return this.fetch<PaginatedResult<Product>>(`/products${query ? `?${query}` : ""}`);
  }

  async getProduct(id: number): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    return this.fetch<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await this.fetch<void>(`/products/${id}`, { method: "DELETE" });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const result = await this.fetch<PaginatedResult<Category> | Category[]>("/categories");
    if (Array.isArray(result)) {
      return result;
    }
    return result.data;
  }

  async getCategory(id: number): Promise<Category> {
    return this.fetch<Category>(`/categories/${id}`);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return this.fetch<Category>(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number): Promise<void> {
    await this.fetch<void>(`/categories/${id}`, { method: "DELETE" });
  }

  // Cart
  async getCart(): Promise<Cart> {
    return this.fetch<Cart>("/cart");
  }

  async addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    return this.fetch<Cart>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    return this.fetch<Cart>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number): Promise<void> {
    await this.fetch<void>(`/cart/items/${itemId}`, { method: "DELETE" });
  }

  async clearCart(): Promise<void> {
    await this.fetch<void>("/cart", { method: "DELETE" });
  }

  // Orders
  async checkout(): Promise<{ order: Order; success: boolean }> {
    return this.fetch<{ order: Order; success: boolean }>("/orders", {
      method: "POST",
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.fetch<Order[]>("/orders");
  }

  async getOrder(id: number): Promise<Order> {
    return this.fetch<Order>(`/orders/${id}`);
  }

  // Users
  async getMe(): Promise<User> {
    return this.fetch<User>("/users/me");
  }

  async getAllUsers(): Promise<User[]> {
    return this.fetch<User[]>("/users");
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

  async toggleBan(clerkId: string): Promise<User> {
    return this.fetch<User>(`/users/ban/${clerkId}`, { method: "POST" });
  }

  async toggleLock(clerkId: string): Promise<User> {
    return this.fetch<User>(`/users/lock/${clerkId}`, { method: "POST" });
  }
}

export const api = new ApiClient();

