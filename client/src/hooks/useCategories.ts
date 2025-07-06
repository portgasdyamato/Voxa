import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Category, InsertCategory } from "@shared/schema";

const API_BASE = "";

// Default categories for new users
export const DEFAULT_CATEGORIES = [
  { name: "Work", color: "#3B82F6" },      // Blue
  { name: "Personal", color: "#10B981" },   // Green
  { name: "Shopping", color: "#F59E0B" },   // Yellow
  { name: "Health", color: "#EF4444" },     // Red
  { name: "Learning", color: "#8B5CF6" },   // Purple
];

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch(`${API_BASE}/api/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: InsertCategory): Promise<Category> => {
      const response = await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      if (!response.ok) {
        throw new Error("Failed to create category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<InsertCategory> }): Promise<Category> => {
      const response = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update category");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// Helper function to create default categories for new users
export function useCreateDefaultCategories() {
  const createCategory = useCreateCategory();
  
  const createDefaults = async () => {
    for (const category of DEFAULT_CATEGORIES) {
      try {
        await createCategory.mutateAsync(category);
      } catch (error) {
        console.error("Failed to create default category:", category.name, error);
      }
    }
  };
  
  return { createDefaults, isLoading: createCategory.isPending };
}
