"use client";

import { useOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, Tag, ArrowLeft, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";
import { use } from "react";

export default function OrderDetailsPage({ params }: { params: Promise<{ publicId: string }> }) {
    // Ungalvanize params using use() for Next.js 15+ compatibility
    const resolvedParams = use(params);
    const orderId = resolvedParams.publicId;

    const { data: order, isLoading, error } = useOrder(orderId);

    // Optimistic loading logic
    const showLoading = isLoading || (order === undefined && !error);

    if (showLoading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-10 w-10 rounded-full bg-secondary/30" />
                    <Skeleton className="h-8 w-48 bg-secondary/30" />
                </div>
                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-border/50 bg-card rounded-[2rem] overflow-hidden">
                            <CardHeader>
                                <Skeleton className="h-8 w-48 bg-secondary/30" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-xl bg-secondary/30" />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-[2rem] bg-secondary/30" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <div className="h-24 w-24 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h2 className="text-3xl font-heading font-black text-foreground mb-4">Order not found</h2>
                <p className="text-muted-foreground mb-8">We couldn't retrieve the details for order #{orderId}.</p>
                <Link href="/orders">
                    <Button className="rounded-xl bg-primary hover:bg-primary/90 h-12 px-8 font-bold">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/orders">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight">
                            Order #{order.orderId}
                        </h1>
                        <div className="flex items-center gap-3 mt-1 text-muted-foreground font-medium">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt)}
                        </div>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={`
                        px-4 py-1.5 font-bold uppercase tracking-wider text-xs border
                        ${ORDER_STATUS_CONFIG[order.status]?.className || 'bg-secondary text-foreground'}
                    `}
                >
                    {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                </Badge>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card rounded-[2rem] shadow-sm overflow-hidden">
                        <CardHeader className="bg-secondary/10 border-b border-border/30 px-8 py-6">
                            <CardTitle className="font-heading text-xl font-bold flex items-center gap-3">
                                <Package className="h-5 w-5 text-primary" />
                                Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-secondary/30 flex-shrink-0 border border-border">
                                            {item.product.imageUrl ? (
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Package className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-heading font-bold text-lg text-foreground truncate">
                                                {item.product.name}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm font-medium text-muted-foreground">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary">{formatCurrency(item.priceAtPurchase)}</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-lg text-foreground whitespace-nowrap">
                                            {formatCurrency(Number(item.priceAtPurchase) * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-border/30 space-y-4">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span className="font-medium">Shipping</span>
                                    <span className="font-bold text-primary">Free</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-xl font-heading font-bold text-foreground">Total</span>
                                    <span className="text-3xl font-heading font-black text-primary tracking-tighter">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-border/50 bg-card rounded-[2rem] shadow-sm p-6 sticky top-24">
                        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Order Info</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">Status</p>
                                    <p className={cn("capitalize font-medium", ORDER_STATUS_CONFIG[order.status]?.className.split(' ').find(c => c.startsWith('text-')))}>
                                        {ORDER_STATUS_CONFIG[order.status]?.label || order.status}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">Date Placed</p>
                                    <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/30">
                            <Link href="/products" className="block w-full">
                                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                                    Buy Again
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
