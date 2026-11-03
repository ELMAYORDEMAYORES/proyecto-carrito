import { apiFetch } from "@/lib/api";
import type {
  Category,
  ListResponse,
  OrderConfirmation,
  PublicProduct,
  PublicStore,
  Paginated,
} from "@/lib/types";

export interface CatalogProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string | null;
  items: CreateOrderItemInput[];
}

export function getStore(slug: string): Promise<PublicStore> {
  return apiFetch<PublicStore>(`/api/catalog/${slug}`);
}

export function listCatalogCategories(
  slug: string
): Promise<ListResponse<Category>> {
  return apiFetch<ListResponse<Category>>(`/api/catalog/${slug}/categories`);
}

export function listCatalogProducts(
  slug: string,
  filters: CatalogProductFilters = {}
): Promise<Paginated<PublicProduct>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<Paginated<PublicProduct>>(
    `/api/catalog/${slug}/products${qs ? `?${qs}` : ""}`
  );
}

export function getCatalogProduct(
  slug: string,
  id: string
): Promise<PublicProduct> {
  return apiFetch<PublicProduct>(`/api/catalog/${slug}/products/${id}`);
}

export function createOrder(
  slug: string,
  input: CreateOrderInput
): Promise<OrderConfirmation> {
  return apiFetch<OrderConfirmation>(`/api/catalog/${slug}/orders`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
