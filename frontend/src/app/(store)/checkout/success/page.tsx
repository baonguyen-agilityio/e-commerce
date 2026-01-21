"use client";

import { useSearchParams } from "next/navigation";
import { useOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Calendar, Tag, Sprout } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const orderId = Number(searchParams.get("orderId"));

    const { data: order, isLoading, error } = useOrder(orderId);

    // Optimistic loading: Show loading if loading OR if data is undefined and no error
    const showLoading = isLoading || (order === undefined && !error);

    if (showLoading) {
        return (
            <div className="container mx-auto px-4 py-16 space-y-8 max-w-4xl">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-20 w-20 rounded-full bg-secondary/30" />
                    <Skeleton className="h-10 w-64 bg-secondary/30" />
                    <Skeleton className="h-4 w-48 bg-secondary/30" />
                </div>
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
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-lg">
                <div className="h-24 w-24 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <h2 className="text-3xl font-heading font-black text-foreground mb-4">Order not found</h2>
                <p className="text-muted-foreground mb-8">We couldn't retrieve the details for this order. Please check your order history.</p>
                <Link href="/orders">
                    <Button className="rounded-xl bg-primary hover:bg-primary/90 h-12 px-8 font-bold">
                        View My Orders
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Success Header */}
            <div className="flex flex-col items-center text-center mb-12">
                <div className="relative mb-6">
                    <div className="absolute inset-0 scale-150 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                    <CheckCircle2 className="h-20 w-20 text-primary relative z-10 animate-bounce" />
                </div>
                <Badge className="bg-secondary text-primary border-0 mb-4 px-4 py-1 font-bold text-sm">
                    <Sprout className="h-3 w-3 mr-2 fill-primary" />
                    Greenery on the Way!
                </Badge>
                <h1 className="text-4xl md:text-5xl font-heading font-black text-foreground tracking-tight mb-4">
                    Order Confirmed
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                    Thank you for your purchase. We&apos;ll notify you when your seeds and plants are ready to ship.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card rounded-[2rem] shadow-sm overflow-hidden">
                        <CardHeader className="bg-secondary/10 border-b border-border/30 px-8 py-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <CardTitle className="font-heading text-2xl font-bold flex items-center gap-3">
                                    <Package className="h-6 w-6 text-primary" />
                                    Order Summary
                                </CardTitle>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                                    <p className="font-mono text-sm font-bold bg-background px-3 py-1 rounded-lg border border-border">#{order.id}</p>
                                </div>
                            </div>
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
                                                <Package className="h-10 w-10 m-auto text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-heading font-bold text-lg text-foreground truncate">{item.product.name}</h4>
                                            <div className="flex items-center gap-4 mt-1">
                                                <p className="text-sm font-medium text-muted-foreground">Qty: {item.quantity}</p>
                                                <p className="text-sm font-bold text-primary">{formatCurrency(item.priceAtPurchase)} each</p>
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
                                    <span className="text-xl font-heading font-bold text-foreground">Total Paid</span>
                                    <span className="text-3xl font-heading font-black text-primary tracking-tighter">
                                        {formatCurrency(order.total)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="border-border/50 bg-card rounded-[2rem] shadow-sm p-6">
                        <h3 className="font-heading font-bold text-xl mb-4 text-foreground">Next Steps</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Tag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">Processing</p>
                                    <p className="text-muted-foreground leading-snug">Our greenhouse team is preparing your selection.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div className="text-sm">
                                    <p className="font-bold text-foreground">Estimated Shipping</p>
                                    <p className="text-muted-foreground">{format(new Date(new Date().setDate(new Date().getDate() + 3)), "EEE, MMM d")}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        <Link href="/products" className="block w-full">
                            <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 group">
                                Continue Shopping
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <Link href="/orders" className="block w-full">
                            <Button variant="outline" className="w-full h-12 rounded-xl border-border text-foreground hover:bg-secondary font-bold">
                                View All Orders
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
