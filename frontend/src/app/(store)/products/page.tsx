"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, Package } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useProducts({
    search: search || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
    sort: sortBy,
    order: sortOrder,
    page,
    limit: 12,
  });

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl) {
      setSearch(searchFromUrl);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setPriceRange([0, 1000]);
    setSearch("");
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split("-");
    setSortBy(sort);
    setSortOrder(order as "ASC" | "DESC");
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-slate-900">All Products</h1>
        <p className="text-slate-500 mt-1">
          {productsData?.total || 0} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 h-10 bg-white border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="flex gap-2">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="cursor-pointer border-slate-200 text-slate-600 hover:bg-slate-100">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-white">
                  <div className="mt-6">
                    <ProductFilters
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px] cursor-pointer h-10 bg-white border-slate-200 text-slate-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-DESC" className="cursor-pointer">
                    Newest
                  </SelectItem>
                  <SelectItem value="createdAt-ASC" className="cursor-pointer">
                    Oldest
                  </SelectItem>
                  <SelectItem value="price-ASC" className="cursor-pointer">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-DESC" className="cursor-pointer">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="name-ASC" className="cursor-pointer">
                    Name: A-Z
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square rounded-lg bg-slate-200" />
                  <Skeleton className="h-4 w-3/4 bg-slate-200" />
                  <Skeleton className="h-4 w-1/2 bg-slate-200" />
                </div>
              ))}
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                <Package className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-500 mb-4">No products found</p>
              <Button
                variant="outline"
                className="cursor-pointer border-slate-200 text-slate-700 hover:bg-slate-100"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {productsData?.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="cursor-pointer h-10 w-10 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-slate-600 px-4">
                    Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                    <span className="font-semibold text-slate-900">{productsData.totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === productsData.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="cursor-pointer h-10 w-10 border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
