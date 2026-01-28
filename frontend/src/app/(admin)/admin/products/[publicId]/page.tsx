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
    const publicId = params.publicId as string;

    const { data: product, isLoading, error } = useProduct(publicId);
    const { data: categoriesResult } = useCategories({ limit: 100 });
    const categories = categoriesResult?.data || [];
    const updateProduct = useUpdateProduct();

    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleUpdate = async (data: Partial<Product>) => {
        if (product) {
            await updateProduct.mutateAsync({ publicId: product.publicId, data });
            setIsEditOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl bg-secondary/50" />
                    <Skeleton className="h-8 w-48 rounded-lg bg-secondary/50" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-[400px] rounded-[2rem] bg-secondary/50" />
                    <div className="space-y-6">
                        <Skeleton className="h-[200px] rounded-[2rem] bg-secondary/50" />
                        <Skeleton className="h-[150px] rounded-[2rem] bg-secondary/50" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <div className="h-24 w-24 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground">Product not found</h2>
                <Button variant="outline" className="rounded-xl" onClick={() => router.back()}>
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
                        className="h-10 w-10 rounded-xl hover:bg-secondary hover:text-foreground"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
                            Product Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            View and manage product information
                        </p>
                    </div>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-lg shadow-primary/20 rounded-xl h-10 px-4 font-bold">
                            <Pencil className="h-4 w-4" />
                            Edit Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg bg-card border-border rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-foreground font-heading text-2xl">Edit Product</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
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
                <Card className="overflow-hidden border-border/50 bg-card rounded-[2rem] shadow-sm">
                    <div className="relative aspect-square w-full bg-secondary/10">
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
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                                <Package className="h-24 w-24 mb-4" />
                                <p>No image available</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <Card className="border-border/50 bg-card rounded-[2rem] shadow-sm h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-heading font-bold text-foreground">
                                        {product.name}
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-muted-foreground font-mono">
                                        ID: {product.publicId}
                                    </CardDescription>
                                </div>
                                <Badge
                                    className={
                                        product.isActive
                                            ? "bg-primary/20 text-primary border-primary/20"
                                            : "bg-secondary text-muted-foreground border-border/50"
                                    }
                                >
                                    {product.isActive ? "Active" : "Draft"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="prose prose-sm text-muted-foreground">
                                <p>{product.description || "No description provided."}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[1.5rem] bg-primary/10 border border-primary/20">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Price</span>
                                    </div>
                                    <p className="text-3xl font-heading font-bold text-foreground">
                                        {formatCurrency(product.price)}
                                    </p>
                                </div>
                                <div className="p-5 rounded-[1.5rem] bg-secondary/30 border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                        <Layers className="h-4 w-4" />
                                        <span className="text-sm font-bold uppercase tracking-wider">Stock</span>
                                    </div>
                                    <p className="text-3xl font-heading font-bold text-foreground">
                                        {product.stock}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/30">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Tag className="h-4 w-4" />
                                        <span>Category</span>
                                    </div>
                                    <Badge variant="outline" className="text-foreground border-border bg-secondary/20">
                                        {product.category?.name || "Uncategorized"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Created At</span>
                                    </div>
                                    <span className="text-foreground font-medium">
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
