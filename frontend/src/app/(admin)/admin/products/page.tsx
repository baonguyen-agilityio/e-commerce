"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import { useDebounce } from "@/hooks/useDebounce";
import { useCategories } from "@/hooks/use-categories";
import { Product } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { ProductForm } from "@/components/admin/product-form";
import { StatsCard } from "@/components/admin/stats-card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Eye,
  EyeOff,
  DollarSign,
  Search,
  Sprout,
  Leaf,
  Filter,
} from "lucide-react";
import { keepPreviousData } from "@tanstack/react-query";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  // Pagination State
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Products query (paginated, for the table)
  const { data: productsData, isLoading: isTableLoading } = useProducts({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearch || undefined,
    categoryId: selectedCategory === "all" ? undefined : Number(selectedCategory),
  }, { placeholderData: keepPreviousData });

  // Stats query
  const { data: allProductsData, isLoading: isStatsLoading } = useProducts({ limit: 9999 });

  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const products: Product[] = (productsData as any)?.data || [];
  const pageCount: number = (productsData as any)?.totalPages || 0;

  // Calculate stats
  const allProducts: Product[] = (allProductsData as any)?.data || [];
  const totalProducts = (allProductsData as any)?.total || 0;
  const activeProducts = allProducts.filter((p: Product) => p.isActive).length;
  const totalValue = allProducts.reduce(
    (acc: number, p: Product) => acc + Number(p.price) * p.stock,
    0
  );

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
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-secondary/30 border border-border/50 flex-shrink-0">
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
                <Leaf className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate max-w-[200px]">
              {row.original.name}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
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
        <span className="font-mono font-black text-primary">
          {formatCurrency(row.original.price)}
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
              ? "bg-green-100/50 text-green-700 border-green-200"
              : row.original.stock > 0
                ? "bg-amber-100/50 text-amber-700 border-amber-200"
                : "bg-red-100/50 text-red-700 border-red-200"
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
        <Badge variant="outline" className="border-border text-muted-foreground font-medium">
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
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-secondary text-muted-foreground border-border"
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer hover:bg-secondary hover:text-foreground rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-card border-border rounded-xl shadow-lg">
            <DropdownMenuItem
              onClick={() => router.push(`/admin/products/${row.original.id}`)}
              className="cursor-pointer focus:bg-secondary focus:text-foreground rounded-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setEditingProduct(row.original)}
              className="cursor-pointer focus:bg-secondary focus:text-foreground rounded-lg"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => setDeletingProduct(row.original)}
              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isTableLoading && !productsData) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-secondary/50 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[500px] bg-secondary/50 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {isStatsLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[2rem] bg-secondary/50" />
          ))
        ) : (
          <>
            <StatsCard
              title="Total Products"
              value={totalProducts}
              icon={Package}
              description="Total items in catalog"
              iconClassName="bg-violet-100/50 text-violet-600"
            />
            <StatsCard
              title="Active Inventory"
              value={activeProducts}
              icon={Sprout}
              description="Currently live in store"
              iconClassName="bg-green-100/50 text-green-600"
            />
            <StatsCard
              title="Inventory Value"
              value={formatCurrency(totalValue)}
              icon={DollarSign}
              description="Total stock value"
              iconClassName="bg-amber-100/50 text-amber-600"
            />
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-2 rounded-[2rem] border border-border/50 shadow-sm pl-4 pr-2 py-2">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-11 border-border bg-secondary/20 focus:bg-background focus:border-primary focus:ring-primary/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({ ...pagination, pageIndex: 0 });
              }}
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              setPagination({ ...pagination, pageIndex: 0 });
            }}
          >
            <SelectTrigger className="w-[180px] h-11 border-border bg-secondary/20 rounded-xl focus:ring-primary/20">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border">
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20 rounded-xl h-11 px-6 font-bold w-full md:w-auto">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card border-border rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-foreground font-heading text-2xl">Add New Product</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details to add a new item to your garden.
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
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="sm:max-w-lg bg-card border-border rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading text-2xl">Edit Product</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
        <AlertDialogContent className="bg-card border-border rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading">Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to compost &quot;{deletingProduct?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-xl border-border hover:bg-secondary hover:text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
