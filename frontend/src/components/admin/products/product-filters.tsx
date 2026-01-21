"use client";

import { Category } from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductFiltersProps {
    categories: Category[];
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    status: string;
    onStatusChange: (value: string) => void;
    stock: string;
    onStockChange: (value: string) => void;
    onReset: () => void;
    hasActiveFilters: boolean;
}

export function ProductFilters({
    categories,
    selectedCategory,
    onCategoryChange,
    status,
    onStatusChange,
    stock,
    onStockChange,
    onReset,
    hasActiveFilters,
}: ProductFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-[160px] h-10 border-border bg-secondary/20 rounded-xl focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                        <SelectValue placeholder="Category" />
                    </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[140px] h-10 border-border bg-secondary/20 rounded-xl focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                        <SelectValue placeholder="Status" />
                    </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
            </Select>

            {/* Stock Filter */}
            <Select value={stock} onValueChange={onStockChange}>
                <SelectTrigger className="w-[140px] h-10 border-border bg-secondary/20 rounded-xl focus:ring-primary/20">
                    <div className="flex items-center gap-2">
                        <SelectValue placeholder="Stock" />
                    </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
            </Select>

            {/* Reset Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl"
                >
                    <X className="h-4 w-4 mr-2" />
                    Reset
                </Button>
            )}
        </div>
    );
}
