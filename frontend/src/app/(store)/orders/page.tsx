"use client";

import { useOrdersByUser } from "@/hooks/use-orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { OrderCard } from "./order-card";
import { Button } from "@/components/ui/button";
import { Package, Calendar, MapPin, Truck, Leaf, ArrowRight, Sprout, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";

export default function OrdersPage() {
    const [page, setPage] = useState(1);
    const limit = 5;

    const { data, isLoading, isError } = useOrdersByUser(
        { page, limit },
        { placeholderData: keepPreviousData }
    );

    const orders = data?.data;
    const totalPages = data?.totalPages || 1;

    // Show loading if explicitly loading OR if we have no data and no error yet
    // This prevents the "empty state" flash while the query is initializing
    const showLoading = isLoading || (orders === undefined && !isError);

    if (showLoading) {
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
                    No orders yet
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
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || isLoading}
                        className="h-12 w-12 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 cursor-pointer disabled:opacity-40"
                    >
                        <ChevronLeft className="h-6 w-6 text-primary" />
                    </Button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Button
                                key={p}
                                variant={p === page ? "default" : "outline"}
                                size="icon"
                                onClick={() => setPage(p)}
                                disabled={isLoading}
                                className={`h-12 w-12 rounded-full cursor-pointer transition-all duration-300 ${p === page
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                                        : "border-primary/20 hover:border-primary hover:bg-primary/5 text-muted-foreground"
                                    }`}
                            >
                                {p}
                            </Button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || isLoading}
                        className="h-12 w-12 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 cursor-pointer disabled:opacity-40"
                    >
                        <ChevronRight className="h-6 w-6 text-primary" />
                    </Button>
                </div>
            )}
        </div>
    );
}
