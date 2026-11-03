import { apiFetch } from "@/lib/api";
import type { AdminStats, AdminTenant, TenantStatus, Paginated } from "@/lib/types";

export interface AdminTenantFilters {
  page?: number;
  limit?: number;
  status?: TenantStatus;
  search?: string;
}

export function getAdminStats(): Promise<AdminStats> {
  return apiFetch<AdminStats>("/api/admin/stats");
}

export function listAdminTenants(
  filters: AdminTenantFilters = {}
): Promise<Paginated<AdminTenant>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return apiFetch<Paginated<AdminTenant>>(
    `/api/admin/tenants${qs ? `?${qs}` : ""}`
  );
}

export function approveTenant(
  id: string
): Promise<{ id: string; status: TenantStatus }> {
  return apiFetch(`/api/admin/tenants/${id}/approve`, { method: "POST" });
}

export function rejectTenant(
  id: string,
  reason: string
): Promise<{ id: string; status: TenantStatus; rejectionReason: string }> {
  return apiFetch(`/api/admin/tenants/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
