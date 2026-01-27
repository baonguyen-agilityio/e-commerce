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
import { cn, formatCurrency } from "@/lib/utils";

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
      { publicId: product.publicId, quantity: 1 },
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
    <Link href={`/products/${product.publicId}`} className="group block">
      <article className="relative bg-card rounded-3xl overflow-hidden transition-all duration-700 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-border group-hover:border-primary/30">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary/30">
          {/* Skeleton Loader */}
          {!imageLoaded && product.imageUrl && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-1000 ease-out",
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
                "group-hover:scale-105"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}

          {/* Gradient Overlays - Premium Softness */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {/* Badges - Luxury Pill Style */}
            <div className="flex flex-col gap-2">
              {isOutOfStock && (
                <Badge className="bg-destructive/90 text-destructive-foreground border-0 backdrop-blur-md shadow-xl px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Sold Out
                </Badge>
              )}
              {isLowStock && (
                <Badge className="bg-accent text-accent-foreground border-0 backdrop-blur-md shadow-xl px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Rare Find
                </Badge>
              )}
              {product.category && (
                <Badge className="bg-white/95 backdrop-blur-md text-foreground border-0 shadow-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-[-4px] group-hover:translate-y-0">
                  {product.category.name}
                </Badge>
              )}
            </div>

            {/* Like Button - Floating Luxe */}
            <button
              onClick={handleLike}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 cursor-pointer shadow-xl backdrop-blur-md border border-white/20",
                isLiked
                  ? "bg-red-500 text-white scale-110"
                  : "bg-white/90 text-muted-foreground hover:text-red-500 hover:scale-110"
              )}
            >
              <Heart className={cn("h-5 w-5 transition-transform duration-500", isLiked && "fill-current scale-110")} />
            </button>
          </div>

          {/* Bottom Actions - Tactile Pill Hover */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out-expo pointer-events-none group-hover:pointer-events-auto">
            <Button
              className={cn(
                "cursor-pointer flex items-center h-12 px-6 font-bold shadow-2xl transition-all duration-500 rounded-xl whitespace-nowrap",
                isAdded
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-foreground hover:bg-foreground/90 text-background",
                isOutOfStock && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending}
            >
              {isAdded ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Added
                </>
              ) : (
                <>
                  {addToCart.isPending ? (
                    <div className="h-5 w-5 mr-2 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 mr-2" />
                  )}
                  Add to Garden
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="cursor-pointer h-12 w-12 bg-white/95 backdrop-blur-md border-0 shadow-2xl hover:bg-white hover:scale-110 transition-all duration-500 rounded-xl"
            >
              <Eye className="h-5 w-5 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Content - Sophisticated Spacing */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.floor(rating)
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">({reviewCount} reviews)</span>
            </div>

            {/* Stock Mini Indicator */}
            {!isOutOfStock && (
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isLowStock ? "text-accent" : "text-primary"
              )}>
                {isLowStock ? "Few Left" : "In Stock"}
              </span>
            )}
          </div>

          <h3 className="font-heading text-lg font-bold text-card-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors duration-500 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-end justify-between mt-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground tracking-tighter">
                  {formatCurrency(product.price)}
                </span>
                {Number(product.price) > 50 && (
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    {formatCurrency(Number(product.price) * 1.25)}
                  </span>
                )}
              </div>
            </div>

            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors duration-500">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
