"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Minus, Plus, ArrowLeft, Check, Package, Truck, Shield, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { data: product, isLoading, error } = useProduct(productId);
  const { isSignedIn } = useAuth();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    addToCart.mutate({ productId, quantity });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-xl bg-slate-200" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-slate-200" />
            <Skeleton className="h-6 w-1/4 bg-slate-200" />
            <Skeleton className="h-24 w-full bg-slate-200" />
            <Skeleton className="h-12 w-full bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
          <Package className="h-10 w-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Product not found</h2>
        <Link href="/products">
          <Button className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-slate-900 transition-colors cursor-pointer">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-slate-900 transition-colors cursor-pointer">
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-24 w-24 text-slate-300" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
              <Badge className="text-lg px-4 py-2 bg-red-500 text-white">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category */}
          {product.category && (
            <Badge className="self-start mb-4 bg-slate-100 text-slate-700 border-0">
              {product.category.name}
            </Badge>
          )}

          {/* Name */}
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <p className="font-mono text-3xl font-bold text-amber-600 mb-6">
            ${Number(product.price).toFixed(2)}
          </p>

          {/* Description */}
          {product.description && (
            <p className="text-slate-600 mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          <Separator className="my-6 bg-slate-200" />

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            {product.stock > 0 ? (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-sm text-slate-700">
                  {product.stock > 10
                    ? "In Stock"
                    : `Only ${product.stock} left in stock`}
                </span>
              </>
            ) : (
              <span className="text-sm text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-slate-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 cursor-pointer border-slate-200 hover:bg-slate-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium text-slate-900">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 cursor-pointer border-slate-200 hover:bg-slate-100"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 h-12"
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCart.isPending}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            {addToCart.isPending
              ? "Adding..."
              : isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 mb-2">
                <Truck className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-xs text-slate-600">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 mb-2">
                <Shield className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-xs text-slate-600">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 mb-2">
                <RefreshCw className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-xs text-slate-600">Easy Returns</span>
            </div>
          </div>

          {/* Back Link */}
          <Link href="/products" className="mt-6">
            <Button variant="ghost" className="cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
