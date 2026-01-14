"use client";

import { useState } from "react";
import { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FolderTree, FileText } from "lucide-react";

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
        <Label htmlFor="name" className="text-slate-700 flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-slate-400" />
          Category Name
        </Label>
        <Input
          id="name"
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-700 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Brief description of this category..."
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
          rows={3}
          className="bg-slate-50 border-slate-200 focus:bg-white focus:border-amber-300 focus:ring-amber-100 resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {category ? "Update Category" : "Create Category"}
      </Button>
    </form>
  );
}
