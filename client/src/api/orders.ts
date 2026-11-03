import { apiFetch, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import type { Order, OrderStatus, Paginated } from "@/lib/types";

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export function listOrders(
  filters: OrderFilters = {}
): Promise<Paginated<Order>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return apiFetch<Paginated<Order>>(`/api/orders${qs ? `?${qs}` : ""}`);
}

export function getOrder(id: string): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${id}`);
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function exportOrdersCsv(): Promise<void> {
  const accessToken = useAuthStore.getState().accessToken;
  const res = await fetch("/api/orders/export", {
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError(res.status, "Error al exportar los pedidos");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
