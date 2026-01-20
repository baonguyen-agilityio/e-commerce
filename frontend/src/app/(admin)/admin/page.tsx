"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useProducts } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { useCategories } from "@/hooks/use-categories";
import { StatsCard } from "@/components/admin/stats-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ShoppingCart,
  DollarSign,
  FolderTree,
  TrendingUp,
  Clock,
  Sprout,
  Leaf,
} from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  // Fetch all products for accurate total count
  const { data: allProductsData, isLoading: productsLoading } = useProducts({ limit: 10000 });
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = productsLoading || ordersLoading || categoriesLoading;

  // Calculate stats
  // Use 'total' from metadata if available, otherwise fallback to array length of large fetch
  const totalProducts = (allProductsData as any)?.total || (allProductsData as any)?.data?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue =
    orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
  const totalCategories = categories?.length || 0;

  const products = (allProductsData as any)?.data || []; // For Top Products display

  // Calculate monthly revenue from real orders
  const chartData = useMemo(() => {
    if (!orders) return [];

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    return last6Months.map((date) => {
      const monthStr = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthlyRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === month && orderDate.getFullYear() === year
          );
        })
        .reduce((acc, order) => acc + Number(order.total), 0);

      return {
        date: monthStr,
        revenue: monthlyRevenue,
      };
    });
  }, [orders]);

  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-secondary/50 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[360px] lg:col-span-2 bg-secondary/50 rounded-2xl" />
          <Skeleton className="h-[360px] bg-secondary/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          description="Lifetime earnings"
          trend={{ value: 12.5, isPositive: true }}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
          description="All time orders"
          trend={{ value: 8.2, isPositive: true }}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Active Products"
          value={totalProducts}
          icon={Sprout}
          description="Thriving listings"
          iconClassName="bg-green-50 text-green-600"
        />
        <StatsCard
          title="Categories"
          value={totalCategories}
          icon={FolderTree}
          description="Product families"
          iconClassName="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} total={totalRevenue} />
        </div>

        {/* Recent Orders */}
        <Card className="bg-card border-border/50 shadow-sm rounded-[2rem]">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-heading font-bold text-foreground">
                Recent Harvests
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Latest customer orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/40 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border shadow-sm">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black font-mono text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        order.status === "PAID"
                          ? "bg-green-100/50 text-green-700 border-green-200 text-[10px] font-bold"
                          : "bg-amber-100/50 text-amber-700 border-amber-200 text-[10px] font-bold"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="bg-card border-border/50 shadow-sm rounded-[2rem]">
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Top Performers
            </CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Your most popular plants & goods
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products?.slice(0, 4).map((product: any) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/40 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/admin/products/${product.id}`)}
              >
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-background border border-border flex-shrink-0 group-hover:scale-105 transition-transform">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Leaf className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-black text-primary">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
