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
import { Eye, Package, ShoppingCart, User, Calendar, CreditCard, Sprout, Leaf } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100/50 text-green-700 border-green-200 font-bold";
      case "pending":
        return "bg-amber-100/50 text-amber-700 border-amber-200 font-bold";
      case "cancelled":
        return "bg-red-100/50 text-red-700 border-red-200 font-bold";
      default:
        return "bg-secondary text-muted-foreground border-border font-bold";
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorFn: (row) => String(row.id),
      id: "id",
      header: "Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-foreground">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              {row.original.user?.name || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-secondary/50 text-foreground border-border">
          {row.original.items?.length || 0} items
        </Badge>
      ),
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-mono font-black text-primary">
          {formatCurrency(row.original.total)}
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
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
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
          onClick={(e) => {
            e.stopPropagation();
            setViewingOrder(row.original);
          }}
          className="h-8 w-8 cursor-pointer hover:bg-secondary hover:text-foreground rounded-lg"
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
            <Skeleton key={i} className="h-24 bg-secondary/50 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[500px] bg-secondary/50 rounded-[2rem]" />
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
        <Card className="bg-card border-border/50 shadow-sm rounded-[2rem] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100/50">
              <ShoppingCart className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-black font-heading text-foreground tracking-tight">
                {totalOrders}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 shadow-sm rounded-[2rem] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100/50">
              <CreditCard className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-black font-heading text-foreground tracking-tight">
                {paidOrders}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50 shadow-sm rounded-[2rem] hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/50">
              <Package className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-black font-heading text-amber-600 tracking-tight">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders || []}
        searchKey="id"
        searchPlaceholder="Search order ID..."
        onRowClick={(order) => setViewingOrder(order)}
      />

      {/* Order Details Dialog */}
      <Dialog
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      >
        <DialogContent className="sm:max-w-2xl bg-card border-border rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-heading text-2xl">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Order #{viewingOrder?.id}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
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
                <Card className="bg-secondary/10 border-border/50 rounded-2xl shadow-none">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="font-bold text-foreground">
                      {viewingOrder.user?.name || "Guest"}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {viewingOrder.user?.email}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/10 border-border/50 rounded-2xl shadow-none">
                  <CardContent className="p-4 space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <Badge className={getStatusStyle(viewingOrder.status)}>
                      {viewingOrder.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {viewingOrder.paymentId || "No payment ID"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator className="bg-border" />

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-bold mb-3 text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-primary" />
                  Order Items
                </h4>
                <ScrollArea className="h-[200px] w-full pr-4">
                  <div className="space-y-3">
                    {viewingOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-secondary/10 border border-border/50"
                      >
                        <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-background border border-border flex-shrink-0">
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
                              <Leaf className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate text-foreground">
                            {item.product?.name || "Product"}
                          </p>
                          <p className="text-sm font-medium text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                          </p>
                        </div>
                        <p className="font-mono font-black text-primary">
                          {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator className="bg-border" />

              {/* Total */}
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <span className="font-bold text-foreground text-lg">Total Harvest Value</span>
                <span className="text-2xl font-mono font-black text-primary">
                  {formatCurrency(viewingOrder.total)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
