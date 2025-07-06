import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Palette } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
import type { Category } from "@shared/schema";

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
}

function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "");
  const [color, setColor] = useState(category?.color || "#3B82F6");
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          updates: { name, color }
        });
      } else {
        await createCategory.mutateAsync({ name, color });
      }
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };
  
  const isLoading = createCategory.isPending || updateCategory.isPending;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${
                color === presetColor ? "border-gray-800" : "border-gray-300"
              }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            />
          ))}
        </div>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-20 h-8"
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {category ? "Update" : "Create"} Category
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface CategoryItemProps {
  category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const deleteCategory = useDeleteCategory();
  
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? Tasks in this category will be uncategorized.`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };
  
  return (
    <Card className="glass-effect">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                </DialogHeader>
                <CategoryForm
                  category={category}
                  onClose={() => setIsEditing(false)}
                />
              </DialogContent>
            </Dialog>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoryManager() {
  const [isCreating, setIsCreating] = useState(false);
  const { data: categories, isLoading } = useCategories();
  
  if (isLoading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="animate-pulse">Loading categories...</div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            <CardTitle>Categories</CardTitle>
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm onClose={() => setIsCreating(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        {categories?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No categories yet</p>
            <p className="text-sm">Create your first category to organize tasks</p>
          </div>
        ) : (
          categories?.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
