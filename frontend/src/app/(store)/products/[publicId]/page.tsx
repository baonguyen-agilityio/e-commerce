"use client";

import { useParams } from "next/navigation";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Minus, Plus, ArrowLeft, Package, Truck, ShieldCheck, Sprout, Star, Heart, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const publicId = params.publicId as string;
  const { data: product, isLoading, error } = useProduct(publicId);
  const { isSignedIn } = useAuth();
  const addToCart = useAddToCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    addToCart.mutate({ publicId, quantity });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5] rounded-[2rem] bg-secondary/50" />
          <div className="space-y-6 pt-8">
            <Skeleton className="h-4 w-32 bg-secondary/50" />
            <Skeleton className="h-12 w-3/4 bg-secondary/50" />
            <Skeleton className="h-8 w-1/4 bg-secondary/50" />
            <Skeleton className="h-24 w-full bg-secondary/50" />
            <Skeleton className="h-14 w-full bg-secondary/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
          <Sprout className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Product not found</h2>
        <Link href="/products">
          <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Garden
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      {/* Breadcrumb - Nature Style */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-12">
        <Link href="/" className="hover:text-primary transition-colors cursor-pointer">
          GreenHaven
        </Link>
        <span className="opacity-30">/</span>
        <Link href="/products" className="hover:text-primary transition-colors cursor-pointer">
          Shop
        </Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Product Image - Organic Frame */}
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-secondary/20 border border-border group">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-24 w-24 text-muted-foreground/20" />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge className="text-sm px-6 py-2 bg-destructive text-destructive-foreground border-0 font-black uppercase tracking-widest shadow-2xl">
                Sold Out
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info - Clean Typography */}
        <div className="flex flex-col pt-4">
          {/* Category & Rating */}
          <div className="flex items-center justify-between mb-6">
            {product.category && (
              <Badge className="bg-secondary text-foreground border-0 font-bold px-3 py-1 text-[10px] uppercase tracking-widest">
                {product.category.name}
              </Badge>
            )}
            <div className="flex items-center gap-1.5 ring-1 ring-border px-3 py-1 rounded-full bg-card shadow-sm">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-[10px] font-bold text-foreground">4.9</span>
              <span className="text-[10px] font-medium text-muted-foreground">(128 reviews)</span>
            </div>
          </div>

          {/* Name */}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-tight tracking-tighter">
            {product.name}
          </h1>

          {/* Price & Stock */}
          <div className="flex items-baseline gap-4 mb-8">
            <span className="font-heading text-4xl font-black text-foreground tracking-tighter">
              {formatCurrency(product.price)}
            </span>
            {product.stock > 0 && (
              <span className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Thriving
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-medium max-w-xl">
              {product.description}
            </p>
          )}

          <Separator className="mb-10 opacity-50" />

          {/* Quantity & Actions */}
          {!isOutOfStock && (
            <div className="space-y-8">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Quantity</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center ring-1 ring-border rounded-xl p-1 bg-secondary/30">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 cursor-pointer hover:bg-background hover:shadow-sm rounded-lg transition-all"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg text-foreground">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 cursor-pointer hover:bg-background hover:shadow-sm rounded-lg transition-all"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {product.stock <= 10 && (
                    <span className="text-[11px] font-bold text-accent uppercase tracking-widest">
                      Only {product.stock} left
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/20 h-16 rounded-2xl text-lg font-bold group transition-all active:scale-95"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addToCart.isPending}
                >
                  <ShoppingBag className="h-6 w-6 mr-3 transition-transform group-hover:scale-110" />
                  {addToCart.isPending ? "Planting..." : "Add to Garden"}
                </Button>
                <Button variant="outline" size="icon" className="h-16 w-16 rounded-2xl border-2 border-border hover:border-red-500 hover:text-red-500 transition-all cursor-pointer bg-transparent">
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
            </div>
          )}

          {/* Features - Nature Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-10 border-t border-border">
            <div className="flex items-center gap-4 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <Truck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Safe Arrival</span>
                <span className="text-[10px] font-medium text-muted-foreground">Guaranteed healthy</span>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Secure Checkout</span>
                <span className="text-[10px] font-medium text-muted-foreground">Encrypted Data</span>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Care Guide</span>
                <span className="text-[10px] font-medium text-muted-foreground">Included with order</span>
              </div>
            </div>
          </div>

          {/* Back Link - Subtle */}
          <Link href="/products" className="mt-12 group inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Return to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
