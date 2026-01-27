"use client";

import { useAuth } from "@clerk/nextjs";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useUpdateCartItem, useRemoveFromCart } from "@/hooks/use-cart";
import { useCheckout } from "@/hooks/use-orders";
import { Minus, Plus, Trash2, ShoppingBag, Package, ArrowRight, Sprout, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface CartSheetProps {
    onClose: () => void;
}

export function CartSheet({ onClose }: CartSheetProps) {
    const { isSignedIn } = useAuth();
    const { data: cart, isLoading } = useCart();
    const updateCartItem = useUpdateCartItem();
    const removeFromCart = useRemoveFromCart();
    const checkout = useCheckout();
    const router = useRouter();

    const subtotal = cart?.items?.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity,
        0
    ) || 0;

    const handleQuantityChange = (publicId: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeFromCart.mutate(publicId);
        } else {
            updateCartItem.mutate({ publicId, quantity: newQuantity });
        }
    };

    const handleCheckout = () => {
        onClose();
        router.push("/cart");
    };

    if (!isSignedIn) {
        return (
            <div className="flex flex-col h-full p-6">
                <SheetHeader className="pb-6">
                    <SheetTitle className="font-heading text-2xl text-foreground">Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div>
                        <p className="text-foreground font-semibold mb-1">Sign in to view your cart</p>
                        <p className="text-muted-foreground text-sm">Your cart items will appear here</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col h-full p-6">
                <SheetHeader className="pb-6">
                    <SheetTitle className="font-heading text-2xl text-foreground">Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/50">
                            <Skeleton className="h-20 w-20 rounded-lg bg-muted" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4 bg-muted" />
                                <Skeleton className="h-4 w-1/2 bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!cart?.items?.length) {
        return (
            <div className="flex flex-col h-full p-6">
                <SheetHeader className="pb-6">
                    <SheetTitle className="font-heading text-2xl text-foreground">Shopping Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div>
                        <p className="text-foreground font-semibold mb-1">Your cart is empty</p>
                        <p className="text-muted-foreground text-sm">Start shopping to add items to your cart</p>
                    </div>
                    <Link href="/products" onClick={onClose}>
                        <Button className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-6">
                            Browse Greenery
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-border flex-shrink-0">
                <SheetTitle className="font-heading text-3xl font-black text-foreground tracking-tighter">
                    Your Garden
                    <span className="ml-3 text-sm font-bold text-primary uppercase tracking-widest">
                        {cart.items.length} Units
                    </span>
                </SheetTitle>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 px-8 min-h-0">
                <div className="space-y-6 py-8">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex gap-6 p-5 rounded-[2rem] bg-card border border-border group hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                            {/* Product Image */}
                            <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-secondary/50 border border-border flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                {item.product.imageUrl ? (
                                    <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                        sizes="112px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <Package className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-start justify-between gap-4">
                                    <Link
                                        href={`/products/${item.product.publicId}`}
                                        onClick={onClose}
                                        className="font-heading text-lg font-bold text-card-foreground line-clamp-2 leading-tight hover:text-primary transition-colors cursor-pointer"
                                    >
                                        {item.product.name}
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 cursor-pointer -mt-1 -mr-1 rounded-xl transition-all"
                                        onClick={() => removeFromCart.mutate(item.publicId)}
                                        disabled={removeFromCart.isPending}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-xl font-black text-foreground tracking-tighter">
                                        {formatCurrency(item.product.price)}
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center ring-1 ring-border rounded-xl bg-secondary/30 p-0.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer rounded-lg hover:bg-background hover:shadow-sm"
                                            onClick={() => handleQuantityChange(item.publicId, item.quantity - 1)}
                                            disabled={updateCartItem.isPending}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="text-sm font-black w-8 text-center text-foreground">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 cursor-pointer rounded-lg hover:bg-background hover:shadow-sm"
                                            onClick={() => handleQuantityChange(item.publicId, item.quantity + 1)}
                                            disabled={updateCartItem.isPending}
                                        >
                                            <Plus className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border p-8 space-y-6 bg-background/80 backdrop-blur-xl flex-shrink-0">
                {/* Free Shipping Notice */}
                {subtotal < 100 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-secondary animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <Sprout className="h-5 w-5 text-primary flex-shrink-0 animate-pulse" />
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">
                            Add <span className="text-foreground font-black">{formatCurrency(100 - subtotal)}</span> for Complimentary Shipping
                        </p>
                    </div>
                )}

                <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Value</span>
                        <span className="text-4xl font-black text-foreground tracking-tighter leading-none">{formatCurrency(subtotal)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                        Taxes Included
                    </span>
                </div>

                <Button
                    className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all duration-500 active:scale-95 group"
                    onClick={handleCheckout}
                    disabled={checkout.isPending}
                >
                    {checkout.isPending ? "Finalizing..." : "Review Order"}
                    <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Button>

                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    Secured Checkout
                </p>
            </div>
        </div>
    );
}
