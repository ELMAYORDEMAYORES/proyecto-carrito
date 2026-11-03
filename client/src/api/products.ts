import { apiFetch } from "@/lib/api";
import type { Product, ProductStatus, Paginated } from "@/lib/types";

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  categoryId?: string | null;
  trackInventory?: boolean;
  stock?: number;
  status?: ProductStatus;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}

export function listProducts(
  filters: ProductFilters = {}
): Promise<Paginated<Product>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  const qs = params.toString();
  return apiFetch<Paginated<Product>>(`/api/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export function createProduct(input: CreateProductInput): Promise<Product> {
  return apiFetch<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProduct(id: string): Promise<{ message: string }> {
  return apiFetch(`/api/products/${id}`, { method: "DELETE" });
}

export function addProductImages(id: string, files: File[]): Promise<Product> {
  const form = new FormData();
  files.forEach((f) => form.append("images", f));
  return apiFetch<Product>(`/api/products/${id}/images`, {
    method: "POST",
    body: form,
  });
}

export function removeProductImage(
  id: string,
  filename: string
): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}/images/${filename}`, {
    method: "DELETE",
  });
}
