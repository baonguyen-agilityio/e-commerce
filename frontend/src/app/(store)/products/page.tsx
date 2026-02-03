"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/useDebounce";
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
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, Sprout } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [inStock, setInStock] = useState<boolean | undefined>();
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);

  const { data: productsData, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    categoryId: selectedCategory,
    isActive: true,
    inStock,
    minPrice: debouncedPriceRange[0] > 0 ? debouncedPriceRange[0] : undefined,
    maxPrice: debouncedPriceRange[1] < 1000 ? debouncedPriceRange[1] : undefined,
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
    setInStock(undefined);
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
      <div className="mb-8 pl-4 border-l-4 border-primary/50">
        <h1 className="font-heading text-3xl font-bold text-foreground">Our Garden</h1>
        <p className="text-muted-foreground mt-1 font-medium">
          {productsData?.total || 0} thriving varieties
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
            inStock={inStock}
            onInStockChange={setInStock}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search plants, seeds, care tools..."
                  className="pl-10 h-10 bg-background border-border text-foreground placeholder:text-muted-foreground/70 focus:bg-background focus:border-primary focus:ring-primary/20 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>

            <div className="flex gap-2">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" className="cursor-pointer border-border text-foreground hover:bg-secondary hover:text-foreground rounded-xl">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background">
                  <div className="mt-6">
                    <ProductFilters
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                      inStock={inStock}
                      onInStockChange={setInStock}
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
                <SelectTrigger className="w-[180px] cursor-pointer h-10 bg-background border-border text-foreground rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="createdAt-DESC" className="cursor-pointer focus:bg-secondary focus:text-foreground">
                    Newest Arrivals
                  </SelectItem>
                  <SelectItem value="createdAt-ASC" className="cursor-pointer focus:bg-secondary focus:text-foreground">
                    Oldest
                  </SelectItem>
                  <SelectItem value="price-ASC" className="cursor-pointer focus:bg-secondary focus:text-foreground">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-DESC" className="cursor-pointer focus:bg-secondary focus:text-foreground">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="name-ASC" className="cursor-pointer focus:bg-secondary focus:text-foreground">
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
                  <Skeleton className="aspect-[4/5] rounded-[2rem] bg-secondary/50" />
                  <Skeleton className="h-4 w-3/4 bg-secondary/50" />
                  <Skeleton className="h-4 w-1/2 bg-secondary/50" />
                </div>
              ))}
            </div>
          ) : productsData?.data.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
                <Sprout className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground mb-4 font-medium">No greenery found matching your criteria</p>
              <Button
                variant="outline"
                className="cursor-pointer border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl"
                onClick={handleClearFilters}
              >
                Clear all filters
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
                <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="cursor-pointer h-10 w-10 border-border text-foreground hover:bg-secondary hover:text-foreground rounded-xl disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-4 font-medium">
                    Page <span className="font-bold text-foreground">{page}</span> of{" "}
                    <span className="font-bold text-foreground">{productsData.totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={page === productsData.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="cursor-pointer h-10 w-10 border-border text-foreground hover:bg-secondary hover:text-foreground rounded-xl disabled:opacity-40"
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

import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 pl-4 border-l-4 border-primary/50">
          <Skeleton className="h-10 w-64 bg-secondary/30" />
          <Skeleton className="h-4 w-48 bg-secondary/30 mt-2" />
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Skeleton className="h-[500px] w-full rounded-[2rem] bg-secondary/30" />
          </aside>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] rounded-[2rem] bg-secondary/30" />
                  <Skeleton className="h-4 w-3/4 bg-secondary/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
