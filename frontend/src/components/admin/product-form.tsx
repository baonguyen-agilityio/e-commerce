"use client";

import { useState } from "react";
import { Product, Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Package, DollarSign, Layers, Image as ImageIcon, Eye } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    categoryId: number;
    isActive: boolean;
  }) => void;
  isSubmitting?: boolean;
}

export function ProductForm({
  product,
  categories,
  onSubmit,
  isSubmitting,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || 0);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (price <= 0) newErrors.price = "Price must be positive";
    if (stock < 0) newErrors.stock = "Stock cannot be negative";
    if (!categoryId) newErrors.categoryId = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name,
        description: description || undefined,
        price,
        stock,
        imageUrl: imageUrl || undefined,
        categoryId,
        isActive,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-700 flex items-center gap-2">
          <Package className="h-4 w-4 text-slate-400" />
          Product Name
        </Label>
        <Input
          id="name"
          placeholder="Enter product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of the product..."
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          rows={3}
          className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100 resize-none"
        />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-slate-700 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            Price
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price || ""}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100 font-mono"
          />
          {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock" className="text-slate-700 flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400" />
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            placeholder="0"
            value={stock || ""}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100 font-mono"
          />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-slate-700">
          Category
        </Label>
        <Select
          value={categoryId ? String(categoryId) : undefined}
          onValueChange={(value) => setCategoryId(Number(value))}
        >
          <SelectTrigger className="cursor-pointer bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem
                key={category.id}
                value={String(category.id)}
                className="cursor-pointer"
              >
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId}</p>}
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-slate-700 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          Image URL
        </Label>
        <Input
          id="imageUrl"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100"
        />
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked === true)}
          className="cursor-pointer data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
        />
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-400" />
          <Label htmlFor="isActive" className="cursor-pointer text-slate-700">
            Publish product (visible in store)
          </Label>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
