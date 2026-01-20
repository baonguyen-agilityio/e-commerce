"use client";

import { useState } from "react";
import { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sprout, FileText } from "lucide-react";

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: { name: string; description?: string }) => void;
  isSubmitting?: boolean;
}

export function CategoryForm({
  category,
  onSubmit,
  isSubmitting,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name,
        description: description || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground flex items-center gap-2">
          <Sprout className="h-4 w-4 text-primary" />
          Category Name
        </Label>
        <Input
          id="name"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary/20 border-border focus:bg-background focus:border-primary focus:ring-primary/20 rounded-xl"
        />
        {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of this category..."
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          rows={3}
          className="bg-secondary/20 border-border focus:bg-background focus:border-primary focus:ring-primary/20 resize-none rounded-xl"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-11 font-bold tracking-wide"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {category ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
