"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { Category } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { CategoryForm } from "@/components/admin/category-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreHorizontal, Pencil, Trash2, FolderTree, Hash, Layers } from "lucide-react";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleCreate = async (data: { name: string; description?: string }) => {
    await createCategory.mutateAsync(data);
    setIsCreateOpen(false);
  };

  const handleUpdate = async (data: { name: string; description?: string }) => {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, data });
      setEditingCategory(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <Hash className="h-4 w-4 text-amber-600" />
          </div>
          <span className="font-mono text-slate-500">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <FolderTree className="h-4 w-4 text-slate-500" />
          </div>
          <span className="font-semibold text-slate-900">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-slate-500 line-clamp-2 max-w-[300px]">
          {row.original.description || (
            <span className="italic text-slate-400">No description</span>
          )}
        </span>
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
              onClick={() => setEditingCategory(row.original)}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <FolderTree className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {categories?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Total Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <Layers className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {categories?.length || 0}
              </p>
              <p className="text-sm text-slate-500">Active Categories</p>
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
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900">Add New Category</DialogTitle>
              <DialogDescription className="text-slate-500">
                Create a new category to organize your products.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleCreate}
              isSubmitting={createCategory.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories || []}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Edit Category</DialogTitle>
            <DialogDescription className="text-slate-500">
              Update the category details below.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSubmit={handleUpdate}
              isSubmitting={updateCategory.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
