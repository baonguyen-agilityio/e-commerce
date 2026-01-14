"use client";

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
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = productsLoading || ordersLoading || categoriesLoading;

  // Calculate stats
  const totalProducts = products?.data?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue =
    orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
  const totalCategories = categories?.length || 0;

  // Mock chart data - in real app, this would come from API
  const chartData = [
    { date: "Jan", revenue: 4200 },
    { date: "Feb", revenue: 3800 },
    { date: "Mar", revenue: 5100 },
    { date: "Apr", revenue: 4600 },
    { date: "May", revenue: 5800 },
    { date: "Jun", revenue: 6200 },
    { date: "Jul", revenue: totalRevenue || 5500 },
  ];

  // Recent orders
  const recentOrders = orders?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[360px] lg:col-span-2 bg-slate-100" />
          <Skeleton className="h-[360px] bg-slate-100" />
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
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="Lifetime earnings"
          trend={{ value: 12.5, isPositive: true }}
          iconClassName="bg-emerald-50 text-emerald-600"
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
          title="Products"
          value={totalProducts}
          icon={Package}
          description="Active listings"
          iconClassName="bg-violet-50 text-violet-600"
        />
        <StatsCard
          title="Categories"
          value={totalCategories}
          icon={FolderTree}
          description="Product groups"
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
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg font-semibold text-slate-900">
                Recent Orders
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500">
              Latest customer orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No orders yet</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                    <ShoppingCart className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      Order #{order.id}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold font-mono text-slate-900">
                      ${Number(order.total).toFixed(2)}
                    </p>
                    <Badge
                      variant="secondary"
                      className={
                        order.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                          : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
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
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              Top Products
            </CardTitle>
          </div>
          <CardDescription className="text-slate-500">
            Your best performing products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products?.data?.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-200 cursor-pointer"
              >
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
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
                      <Package className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-mono text-amber-600 font-semibold">
                    ${Number(product.price).toFixed(2)}
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
