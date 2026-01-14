"use client";

import { useAuth } from "@clerk/nextjs";
import { useOrders } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, ShoppingBag, ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
  const { isSignedIn } = useAuth();
  const { data: orders, isLoading } = useOrders();

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">
          Sign in to view your orders
        </h2>
        <p className="text-slate-500 mb-6">
          Create an account or sign in to see your order history
        </p>
        <Link href="/sign-in">
          <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-48 mb-8 bg-slate-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
        <p className="text-slate-500 mb-6">
          Start shopping to see your orders here
        </p>
        <Link href="/products">
          <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-slate-900 mb-8">Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="bg-white border-slate-200 overflow-hidden">
            <CardHeader className="pb-4 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg font-heading text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-amber-500" />
                    Order #{order.id}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusStyle(order.status)}>
                    {order.status}
                  </Badge>
                  <span className="font-mono font-bold text-amber-600">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Separator className="mb-4 bg-slate-200" />
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-6 w-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {item.product?.name || "Product"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-slate-900">
                        ${(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/products">
          <Button variant="outline" className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
