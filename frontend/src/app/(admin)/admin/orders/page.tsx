"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useOrders } from "@/hooks/use-orders";
import { Order } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Package, ShoppingCart, User, Calendar, CreditCard } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

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

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <ShoppingCart className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-mono font-semibold text-slate-900">
            #{row.original.id}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {row.original.user?.name || "Guest"}
            </p>
            <p className="text-xs text-slate-500">{row.original.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
          {row.original.items?.length || 0} items
        </Badge>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-amber-600">
          ${Number(row.original.total).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={getStatusStyle(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewingOrder(row.original)}
          className="h-8 w-8 cursor-pointer hover:bg-amber-50"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-[500px] bg-slate-100" />
      </div>
    );
  }

  // Stats
  const totalOrders = orders?.length || 0;
  const paidOrders = orders?.filter((o) => o.status === "PAID").length || 0;
  const totalRevenue = orders?.reduce((acc, o) => acc + Number(o.total), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {totalOrders}
              </p>
              <p className="text-sm text-slate-500">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {paidOrders}
              </p>
              <p className="text-sm text-slate-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Package className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-amber-600">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={orders || []} />

      {/* Order Details Dialog */}
      <Dialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              Order #{viewingOrder?.id}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Placed on{" "}
              {viewingOrder &&
                new Date(viewingOrder.createdAt).toLocaleString("en-US", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="font-medium text-slate-900">
                      {viewingOrder.user?.name || "Guest"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {viewingOrder.user?.email}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Status
                    </p>
                    <Badge className={getStatusStyle(viewingOrder.status)}>
                      {viewingOrder.status}
                    </Badge>
                    <p className="text-xs text-slate-500 font-mono">
                      {viewingOrder.paymentId || "No payment ID"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator className="bg-slate-200" />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-slate-900">
                  Order Items
                </h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200"
                      >
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                          {item.product?.imageUrl ? (
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-slate-900">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.quantity} × $
                            {Number(item.priceAtPurchase).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-mono font-semibold text-slate-900">
                          $
                          {(
                            Number(item.priceAtPurchase) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator className="bg-slate-200" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-mono font-bold text-amber-600">
                  ${Number(viewingOrder.total).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
