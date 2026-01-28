"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useOrders } from "@/hooks/use-orders";
import { Order } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { StatsCard } from "@/components/admin/stats-card";
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
import {
  Eye,
  Package,
  ShoppingCart,
  User,
  Calendar,
  CreditCard,
  Sprout,
  Leaf,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useState } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { keepPreviousData } from "@tanstack/react-query";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";

export default function AdminOrdersPage() {
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPagination((prev) => {
      if (prev.pageIndex === 0) return prev;
      return { ...prev, pageIndex: 0 };
    });
  }, []);
  const { data: ordersData, isLoading } = useOrders(
    {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: searchTerm || undefined,
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const { data: allOrdersData, isLoading: isStatLoading } = useOrders({
    limit: 9999,
  });

  const orders: Order[] = ordersData?.data || [];
  const pageCount: number = ordersData?.totalPages || 0;

  const columns: ColumnDef<Order>[] = [
    {
      accessorFn: (row) => String(row.publicId),
      id: "id",
      header: "Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-foreground">
            #{row.original.publicId}
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
            <p className="text-xs text-muted-foreground">
              {row.original.user?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className="bg-secondary/50 text-foreground border-border"
        >
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
      cell: ({ row }) => {
        const config = ORDER_STATUS_CONFIG[row.original.status] || {
          label: row.original.status,
          className:
            "bg-secondary text-muted-foreground border-border font-bold",
        };
        return (
          <div className="flex items-center gap-2">
            <Badge className={config.className}>{config.label}</Badge>
            {row.original.status === "FAILED" && row.original.failureReason && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </div>
        );
      },
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
  const totalOrders = allOrdersData?.data?.length || 0;
  const paidOrders =
    allOrdersData?.data?.filter((o) => o.status === "PAID").length || 0;
  const totalRevenue =
    allOrdersData?.data?.reduce((acc, o) => acc + Number(o.total), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {isStatLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-secondary/50 rounded-[2rem]" />
          ))
        ) : (
          <>
            <StatsCard
              title="Total Orders"
              value={totalOrders}
              icon={ShoppingCart}
              description="Total orders placed"
              iconClassName="bg-blue-100/50 text-blue-600"
            />
            <StatsCard
              title="Completed"
              value={paidOrders}
              icon={CreditCard}
              description="Paid and confirmed"
              iconClassName="bg-green-100/50 text-green-600"
            />
            <StatsCard
              title="Revenue"
              value={formatCurrency(totalRevenue)}
              icon={Package}
              description="Total harvest value"
              iconClassName="bg-amber-100/50 text-amber-600"
            />
          </>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={orders}
        searchKey="id"
        searchPlaceholder="Search order ID..."
        onRowClick={(order) => setViewingOrder(order)}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={pageCount}
        onSearch={handleSearch}
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
              Order #{viewingOrder?.publicId}
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
                    <Badge
                      className={
                        ORDER_STATUS_CONFIG[viewingOrder.status]?.className ||
                        "bg-secondary"
                      }
                    >
                      {ORDER_STATUS_CONFIG[viewingOrder.status]?.label ||
                        viewingOrder.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {viewingOrder.paymentId || "No payment ID"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {viewingOrder.status === "FAILED" && viewingOrder.failureReason && (
                <div className="flex items-center gap-3 p-4 bg-destructive/5 border border-destructive/20 rounded-2xl text-destructive text-sm font-medium">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>
                    <span className="font-bold mr-1">Failure Reason:</span>
                    {viewingOrder.failureReason}
                  </p>
                </div>
              )}

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
                            {item.quantity} ×{" "}
                            {formatCurrency(item.priceAtPurchase)}
                          </p>
                        </div>
                        <p className="font-mono font-black text-primary">
                          {formatCurrency(
                            Number(item.priceAtPurchase) * item.quantity,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator className="bg-border" />

              {/* Total */}
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <span className="font-bold text-foreground text-lg">
                  Total Harvest Value
                </span>
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
