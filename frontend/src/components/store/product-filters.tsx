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

interface ProductFiltersProps {
  selectedCategory?: number;
  onCategoryChange: (categoryId: number | undefined) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFiltersProps) {
  const { data: categories, isLoading } = useCategories();

  const hasActiveFilters = selectedCategory !== undefined || priceRange[0] > 0 || priceRange[1] < 1000;

  return (
    <div className="space-y-6 p-5 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="font-heading font-semibold text-slate-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer h-8"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["category", "price"]} className="w-full">
        {/* Categories */}
        <AccordionItem value="category" className="border-slate-200">
          <AccordionTrigger className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:no-underline">
            Category
          </AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-slate-100" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategory === category.id}
                      onCheckedChange={(checked) =>
                        onCategoryChange(checked ? category.id : undefined)
                      }
                      className="cursor-pointer data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1 text-slate-600 hover:text-slate-900"
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
        <AccordionItem value="price" className="border-slate-200 border-b-0">
          <AccordionTrigger className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Slider
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                max={1000}
                min={0}
                step={10}
                className="cursor-pointer"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  ${priceRange[0]}
                </span>
                <span className="text-slate-400">to</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                  ${priceRange[1]}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
