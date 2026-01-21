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
import { StatsCard } from "@/components/admin/stats-card";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreHorizontal, Pencil, Trash2, Sprout, Hash, Leaf } from "lucide-react";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

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

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteCategory.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    }
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/30">
            <Hash className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="font-mono font-bold text-muted-foreground">{row.original.id}</span>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-4 w-4 text-primary" />
          </div>
          <span className="font-bold text-foreground text-base tracking-tight">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium line-clamp-2 max-w-[300px]">
          {row.original.description || (
            <span className="italic text-muted-foreground/50">No description</span>
          )}
        </span>
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
              onClick={() => setEditingCategory(row.original)}
              className="cursor-pointer focus:bg-secondary focus:text-foreground rounded-lg"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => setDeletingCategory(row.original)}
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-secondary/50 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-secondary/50 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard
          title="Total Collections"
          value={categories?.length || 0}
          icon={Sprout}
          description="Categories defined"
          iconClassName="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Active Collections"
          value={categories?.length || 0}
          icon={Leaf}
          description="Visible to customers"
          iconClassName="bg-secondary/30 text-foreground"
        />
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories || []}
        searchKey="name"
        searchPlaceholder="Search categories..."
        actionElement={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20 rounded-xl h-10 px-4 font-bold">
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="text-foreground font-heading text-2xl">Add New Category</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create a new collection for your garden.
                </DialogDescription>
              </DialogHeader>
              <CategoryForm
                onSubmit={handleCreate}
                isSubmitting={createCategory.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-md bg-card border-border rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-foreground font-heading text-2xl">Edit Category</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open: boolean) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent className="bg-card border-border rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-heading">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to remove &quot;{deletingCategory?.name}
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
