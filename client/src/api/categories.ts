import { apiFetch } from "@/lib/api";
import type { Category, ListResponse } from "@/lib/types";

export function listCategories(): Promise<ListResponse<Category>> {
  return apiFetch<ListResponse<Category>>("/api/categories");
}

export function createCategory(name: string): Promise<Category> {
  return apiFetch<Category>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(id: string, name: string): Promise<Category> {
  return apiFetch<Category>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/categories/${id}`, { method: "DELETE" });
}
