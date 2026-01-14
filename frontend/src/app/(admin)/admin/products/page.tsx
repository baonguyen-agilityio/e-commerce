"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Product } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Eye,
  EyeOff,
  DollarSign,
  Layers,
} from "lucide-react";
import Image from "next/image";

export default function AdminProductsPage() {
  const { data: productsData, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const products = productsData?.data || [];

  const handleCreate = async (data: Partial<Product>) => {
    await createProduct.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (data: Partial<Product>) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, data });
      setEditingProduct(null);
    }
  };

  const handleDelete = async () => {
    if (deletingProduct) {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
            {row.original.imageUrl ? (
              <Image
                src={row.original.imageUrl}
                alt={row.original.name}
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
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate max-w-[200px]">
              {row.original.name}
            </p>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">
              {row.original.description || "No description"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-mono font-semibold text-amber-600">
          ${Number(row.original.price).toFixed(2)}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <Badge
          variant="secondary"
          className={
            row.original.stock > 10
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : row.original.stock > 0
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-red-50 text-red-700 border-red-200"
          }
        >
          {row.original.stock} units
        </Badge>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-slate-200 text-slate-600">
          {row.original.category?.name || "Uncategorized"}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }
        >
          {row.original.isActive ? (
            <Eye className="h-3 w-3 mr-1" />
          ) : (
            <EyeOff className="h-3 w-3 mr-1" />
          )}
          {row.original.isActive ? "Active" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => setEditingProduct(row.original)}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setDeletingProduct(row.original)}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalValue = products.reduce(
    (acc, p) => acc + Number(p.price) * p.stock,
    0
  );

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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <Package className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {totalProducts}
              </p>
              <p className="text-sm text-slate-500">Total Products</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Layers className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {activeProducts}
              </p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-amber-600">
                ${totalValue.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500">Inventory Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add New Product</DialogTitle>
              <DialogDescription className="text-slate-500">
                Fill in the details to create a new product.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              categories={categories || []}
              onSubmit={handleCreate}
              isSubmitting={createProduct.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit Product</DialogTitle>
            <DialogDescription className="text-slate-500">
              Update the product details below.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              categories={categories || []}
              onSubmit={handleUpdate}
              isSubmitting={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open: boolean) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete &quot;{deletingProduct?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
