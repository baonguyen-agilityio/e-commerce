"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Product } from "@/types";
import { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Package,
    Sprout,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Get first 4 items for preview
    const previewItems = order.items.slice(0, 4);
    const remainingCount = order.items.length - 4;

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="group rounded-[2rem] bg-card border border-border transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 overflow-hidden"
        >
            {/* Main Card Content (Always Visible) */}
            <div className="p-6 md:p-8 flex flex-col gap-6">

                {/* Header Row: ID, Date, Status, Total */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className="font-heading text-xl font-bold text-foreground">
                                Order #{order.id}
                            </span>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "border-border font-bold uppercase tracking-wider text-xs",
                                    order.status === "completed"
                                        ? "bg-green-500/10 text-green-600 border-green-200"
                                        : "bg-secondary/50 text-foreground"
                                )}
                            >
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
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                Total
                            </span>
                            <span className="font-black text-2xl text-foreground tracking-tight">
                                {formatCurrency(order.total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Preview Row: Thumbnails */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex -space-x-3 overflow-hidden py-2 pl-1">
                        {previewItems.map((item) => (
                            <div
                                key={item.id}
                                className="relative h-12 w-12 rounded-full ring-2 ring-background overflow-hidden bg-secondary shadow-sm"
                            >
                                {item.product.imageUrl ? (
                                    <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-secondary/50">
                                        <Sprout className="h-4 w-4 text-muted-foreground/40" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {remainingCount > 0 && (
                            <div className="relative h-12 w-12 rounded-full ring-2 ring-background bg-secondary flex items-center justify-center shadow-sm">
                                <span className="text-xs font-bold text-muted-foreground">
                                    +{remainingCount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                                <ExternalLink className="h-5 w-5" />
                            </Button>
                        </Link>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(!isOpen)}
                                className="rounded-xl border-border font-bold h-10 px-4 gap-2 hover:bg-secondary hover:text-foreground transition-colors"
                                aria-expanded={isOpen}
                            >
                                {isOpen ? "Hide Details" : "View Details"}
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                </div>
            </div>

            {/* Expanded Details (Collapsible) */}
            <CollapsibleContent className="animate-collapsible-down overflow-hidden">
                <div className="bg-secondary/10 border-t border-border/50 p-6 md:p-8 space-y-4">
                    <h4 className="font-heading font-bold text-sm text-muted-foreground uppercase tracking-widest mb-4">
                        Items in this order
                    </h4>
                    <div className="grid gap-4">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 items-center bg-background rounded-xl p-3 border border-border/50 shadow-sm"
                            >
                                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0 border border-border/50">
                                    {item.product.imageUrl ? (
                                        <Image
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Package className="h-6 w-6 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-heading font-bold text-foreground truncate">
                                        {item.product.name}
                                    </h5>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                                        <span>Qty: {item.quantity}</span>
                                        <span className="text-primary/80">
                                            {formatCurrency(item.priceAtPurchase)}
                                        </span>
                                    </div>
                                </div>
                                <div className="font-bold text-foreground">
                                    {formatCurrency(item.priceAtPurchase * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Link href={`/orders/${order.id}`}>
                            <Button className="rounded-xl font-bold">
                                View Full Receipt <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
