"use client";

import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Eye, Package, Heart, Star, Plus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isSignedIn } = useAuth();
  const addToCart = useAddToCart();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => {
          setIsAdded(true);
          setTimeout(() => setIsAdded(false), 2000);
        },
      }
    );
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from wishlist" : "Added to wishlist");
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  // Mock rating (in real app, this would come from the product data)
  const rating = 4.5;
  const reviewCount = 128;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="relative bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-100 hover:border-slate-200">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
          {/* Skeleton Loader */}
          {!imageLoaded && product.imageUrl && (
            <div className="absolute inset-0 bg-slate-100 animate-pulse" />
          )}
          
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
                "group-hover:scale-110"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-20 w-20 text-slate-200" />
            </div>
          )}

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Top Actions */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            {/* Badges */}
            <div className="flex flex-col gap-2">
              {isOutOfStock && (
                <Badge className="bg-slate-900/90 text-white border-0 backdrop-blur-sm shadow-lg">
                  Sold Out
                </Badge>
              )}
              {isLowStock && (
                <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur-sm shadow-lg">
                  Only {product.stock} left
                </Badge>
              )}
              {product.category && (
                <Badge className="bg-white/95 backdrop-blur-sm text-slate-700 border-0 shadow-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {product.category.name}
                </Badge>
              )}
            </div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 cursor-pointer shadow-lg",
                isLiked 
                  ? "bg-red-500 text-white scale-110" 
                  : "bg-white/95 backdrop-blur-sm text-slate-500 hover:text-red-500 hover:scale-110"
              )}
            >
              <Heart className={cn("h-5 w-5 transition-transform", isLiked && "fill-current scale-110")} />
            </button>
          </div>

          {/* Bottom Actions - Visible on Hover */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
            <Button
              className={cn(
                "cursor-pointer flex-1 h-12 font-semibold shadow-xl transition-all duration-300",
                isAdded
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-white hover:bg-slate-50 text-slate-900",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added!
                </>
              ) : (
                <>
                  {addToCart.isPending ? (
                    <div className="h-5 w-5 mr-2 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="cursor-pointer h-12 w-12 bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:bg-white hover:scale-105 transition-all duration-300"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.floor(rating)
                      ? "fill-amber-400 text-amber-400"
                      : i < rating
                      ? "fill-amber-400/50 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500">({reviewCount})</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[2.5rem] group-hover:text-amber-600 transition-colors duration-300">
            {product.name}
          </h3>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-500 line-clamp-1 mt-1">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                ${Number(product.price).toFixed(2)}
              </span>
              {/* Mock original price for discount display */}
              {Number(product.price) > 50 && (
                <span className="text-sm text-slate-400 line-through">
                  ${(Number(product.price) * 1.2).toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Stock Indicator */}
            {!isOutOfStock && !isLowStock && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">In Stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Add Button - Mobile Friendly */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 md:hidden">
          <Button
            className={cn(
              "w-full cursor-pointer h-12 font-semibold shadow-lg",
              isAdded
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            )}
            onClick={handleAddToCart}
            disabled={isOutOfStock || addToCart.isPending}
          >
            {isAdded ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Added to Cart
              </>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </article>
    </Link>
  );
}
