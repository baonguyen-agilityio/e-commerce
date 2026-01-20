"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/admin/product-form";
import { ArrowLeft, Package, Calendar, Tag, DollarSign, Layers, Pencil } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: product, isLoading, error } = useProduct(id);
    const { data: categories } = useCategories();
    const updateProduct = useUpdateProduct();

    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleUpdate = async (data: Partial<Product>) => {
        if (product) {
            await updateProduct.mutateAsync({ id: product.id, data });
            setIsEditOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[400px] rounded-xl" />
                    <div className="space-y-6">
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[150px]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <Package className="h-16 w-16 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-900">Product not found</h2>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Product Details
                        </h1>
                        <p className="text-sm text-slate-500">
                            View and manage product information
                        </p>
                    </div>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-sm">
                            <Pencil className="h-4 w-4" />
                            Edit Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900">Edit Product</DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Update the product details below.
                            </DialogDescription>
                        </DialogHeader>
                        <ProductForm
                            product={product}
                            categories={categories || []}
                            onSubmit={handleUpdate}
                            isSubmitting={updateProduct.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column - Image */}
                <Card className="overflow-hidden border-slate-200">
                    <div className="relative aspect-square w-full bg-slate-50">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <Package className="h-24 w-24 mb-4" />
                                <p>No image available</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <Card className="border-slate-200">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900">
                                        {product.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        ID: {product.id}
                                    </CardDescription>
                                </div>
                                <Badge
                                    className={
                                        product.isActive
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                    }
                                >
                                    {product.isActive ? "Active" : "Draft"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose prose-sm text-slate-600">
                                <p>{product.description || "No description provided."}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                                    <div className="flex items-center gap-2 text-amber-600 mb-1">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-medium">Price</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                                        <Layers className="h-4 w-4" />
                                        <span className="text-sm font-medium">Stock</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {product.stock}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Tag className="h-4 w-4" />
                                        <span>Category</span>
                                    </div>
                                    <Badge variant="outline" className="text-slate-700">
                                        {product.category?.name || "Uncategorized"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created At</span>
                                    </div>
                                    <span className="text-slate-900 font-medium">
                                        {format(new Date(product.createdAt), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
