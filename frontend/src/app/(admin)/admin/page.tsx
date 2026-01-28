"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";

import { useProducts } from "@/hooks/use-products";
import { useOrders } from "@/hooks/use-orders";
import { useCategories } from "@/hooks/use-categories";
import { StatsCard } from "@/components/admin/stats-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  DollarSign,
  FolderTree,
  TrendingUp,
  Clock,
  Sprout,
  Leaf,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Product, Order } from "@/types";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";

export default function AdminDashboardPage() {
  const router = useRouter();

  const { data: productsData, isLoading: productsLoading } = useProducts({
    limit: 10000,
  });
  const { data: ordersData, isLoading: ordersLoading } = useOrders({
    limit: 10000,
  });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ limit: 100 });

  const isLoading = productsLoading || ordersLoading || categoriesLoading;

  const orders = useMemo(() => ordersData?.data || [], [ordersData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Comprehensive analytics calculation
  const stats = useMemo(() => {
    if (!orders.length)
      return {
        totalRevenue: 0,
        totalOrders: 0,
        revenueTrend: 0,
        ordersTrend: 0,
        successfulOrders: [] as Order[],
      };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const successfulOrders = orders.filter((o: Order) =>
      ["PAID", "COMPLETED"].includes(o.status),
    );
    const totalRevenue = successfulOrders.reduce(
      (acc: number, o: Order) => acc + Number(o.total),
      0,
    );

    // Current period (last 30 days)
    const currentOrders = successfulOrders.filter(
      (o: Order) => new Date(o.createdAt) >= thirtyDaysAgo,
    );
    const currentRevenue = currentOrders.reduce(
      (acc: number, o: Order) => acc + Number(o.total),
      0,
    );

    // Previous period (30-60 days ago)
    const previousOrders = successfulOrders.filter((o: Order) => {
      const date = new Date(o.createdAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    const previousRevenue = previousOrders.reduce(
      (acc: number, o: Order) => acc + Number(o.total),
      0,
    );

    // Calculate trends
    const calculateTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      totalRevenue,
      totalOrders: orders.length,
      revenueTrend: calculateTrend(currentRevenue, previousRevenue),
      ordersTrend: calculateTrend(currentOrders.length, previousOrders.length),
      successfulOrders,
    };
  }, [orders]);

  const totalProducts = productsData?.total || 0;
  const totalCategories = categoriesData?.total || 0;

  // Monthly revenue chart data
  const chartData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d;
    }).reverse();

    return last6Months.map((date) => {
      const monthStr = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthlyRevenue = stats.successfulOrders
        .filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === month && orderDate.getFullYear() === year
          );
        })
        .reduce((acc: number, order: Order) => acc + Number(order.total), 0);

      return {
        date: monthStr,
        revenue: monthlyRevenue,
      };
    });
  }, [stats.successfulOrders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

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
          <Skeleton className="h-[420px] bg-secondary/50 rounded-2xl" />
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
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          description="From successful orders"
          trend={{
            value: Math.abs(stats.revenueTrend),
            isPositive: stats.revenueTrend >= 0,
          }}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          description="Lifetime transactions"
          trend={{
            value: Math.abs(stats.ordersTrend),
            isPositive: stats.ordersTrend >= 0,
          }}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <StatsCard
          title="Active Products"
          value={totalProducts}
          icon={Sprout}
          description="In your greenhouse"
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
        <div className="lg:col-span-2">
          <RevenueChart data={chartData} total={stats.totalRevenue} />
        </div>

        <Card className="bg-card border-border/50 shadow-sm rounded-[2rem] overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg font-heading font-bold text-foreground">
                Recent Harvests
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Latest activity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 px-4 overflow-y-auto max-h-[400px]">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">
                  Clear fields, no orders yet
                </p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const config = ORDER_STATUS_CONFIG[order.status] || {
                  label: order.status,
                  className: "bg-secondary text-secondary-foreground",
                };
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/40 transition-all duration-200 cursor-pointer"
                    onClick={() => router.push(`/admin/orders`)}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border shadow-sm flex-shrink-0">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        Order #{order.publicId}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-black font-mono text-foreground leading-none">
                        {formatCurrency(order.total)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] font-black uppercase px-2 py-0 h-4 border leading-none ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })
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
            Most popular stock
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/20 hover:bg-secondary/40 transition-all duration-200 cursor-pointer group"
                onClick={() => router.push(`/admin/products/${product.publicId}`)}
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
