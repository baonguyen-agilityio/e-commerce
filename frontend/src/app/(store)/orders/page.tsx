"use client";

import { useOrdersByUser } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Truck, Leaf, ArrowRight, Sprout, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
    const { data: orders, isLoading } = useOrdersByUser();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="mb-12 border-l-4 border-primary/50 pl-6">
                    <Skeleton className="h-10 w-64 mb-2 bg-secondary/30" />
                    <Skeleton className="h-6 w-48 bg-secondary/30" />
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48 w-full rounded-[2rem] bg-secondary/30" />
                    ))}
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary mx-auto mb-8">
                    <Leaf className="h-16 w-16 text-primary/40" />
                </div>
                <h2 className="font-heading text-4xl font-black mb-4 text-foreground tracking-tight">
                    No harvest records yet
                </h2>
                <p className="text-muted-foreground mb-10 text-xl font-medium">
                    Start your gardening journey today
                </p>
                <Link href="/products">
                    <Button size="lg" className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
                        <ArrowRight className="h-5 w-5 mr-2" />
                        Browse the Catalogue
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12 border-l-4 border-primary/50 pl-6">
                <h1 className="font-heading text-4xl font-black text-foreground tracking-tight">Garden Journal</h1>
                <p className="text-muted-foreground mt-2 text-lg font-medium">
                    Track the growth of your orders
                </p>
            </div>

            <div className="space-y-8">
                {orders.map((order) => (
                    <div key={order.id} className="group overflow-hidden rounded-[2rem] bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                        {/* Order Header */}
                        <div className="bg-secondary/20 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-heading text-lg font-bold text-foreground">Order #{order.id}</span>
                                    <Badge variant="outline" className="bg-background/50 border-border text-primary font-bold uppercase tracking-wider text-xs">
                                        {order.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(order.createdAt)}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total</span>
                                    <span className="font-black text-2xl text-foreground tracking-tight">{formatCurrency(order.total)}</span>
                                </div>
                                {/* <Button variant="outline" className="rounded-xl h-10 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold">
                  Track
                </Button> */}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6 md:p-8">
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-6 items-center">
                                        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-secondary/50 flex-shrink-0 border border-border">
                                            {item.product.imageUrl ? (
                                                <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Sprout className="h-8 w-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-heading text-lg font-bold text-foreground truncate">
                                                {item.product.name}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground font-medium">
                                                <span>Qty: {item.quantity}</span>
                                                <span>{formatCurrency(item.priceAtPurchase)}</span>
                                            </div>
                                        </div>
                                        {/* Link to product? */}
                                        <Link href={`/products/${item.product.id}`}>
                                            <Button size="icon" variant="ghost" className="rounded-full hover:bg-secondary cursor-pointer">
                                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
