"use client";

import { useCategories } from "@/hooks/use-categories";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductFiltersProps {
  selectedCategory?: number;
  onCategoryChange: (categoryId: number | undefined) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  inStock: boolean | undefined;
  onInStockChange: (inStock: boolean | undefined) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStock,
  onInStockChange,
  onClearFilters,
}: ProductFiltersProps) {
  const { data: categories, isLoading } = useCategories();

  const hasActiveFilters =
    selectedCategory !== undefined ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000 ||
    inStock !== undefined;

  return (
    <div className="space-y-6 p-5 bg-card/50 rounded-[2rem] border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Refine</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer h-8 rounded-lg"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "price"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="category" className="border-border">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-secondary" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 group">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategory === category.id}
                      onCheckedChange={(checked) =>
                        onCategoryChange(checked ? category.id : undefined)
                      }
                      className="cursor-pointer border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1 text-muted-foreground group-hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem value="price" className="border-border border-b-0">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4 pb-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                max={1000}
                min={0}
                step={10}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md text-xs">
                  {formatCurrency(priceRange[0])}
                </span>
                <span className="text-muted-foreground/50 text-xs">to</span>
                <span className="font-mono text-muted-foreground bg-secondary px-2 py-1 rounded-md text-xs">
                  {formatCurrency(priceRange[1])}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability */}
        <AccordionItem value="availability" className="border-border border-b-0">
          <AccordionTrigger className="text-sm font-bold text-foreground hover:text-primary hover:no-underline">
            Availability
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 group">
                <Checkbox
                  id="in-stock"
                  checked={inStock === true}
                  onCheckedChange={(checked) =>
                    onInStockChange(checked ? true : undefined)
                  }
                  className="cursor-pointer border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="in-stock"
                  className="text-sm cursor-pointer flex-1 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  In Stock
                </Label>
              </div>
              <div className="flex items-center gap-2 group">
                <Checkbox
                  id="out-of-stock"
                  checked={inStock === false}
                  onCheckedChange={(checked) =>
                    onInStockChange(checked ? false : undefined)
                  }
                  className="cursor-pointer border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor="out-of-stock"
                  className="text-sm cursor-pointer flex-1 text-muted-foreground group-hover:text-foreground transition-colors"
                >
                  Out of Stock
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
