import { apiFetch } from "@/lib/api";
import type { Tenant, TenantConfig } from "@/lib/types";

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  description?: string;
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
  config?: Partial<TenantConfig>;
}

export function getTenant(): Promise<Tenant> {
  return apiFetch<Tenant>("/api/tenant");
}

export function updateTenant(input: UpdateTenantInput): Promise<Tenant> {
  return apiFetch<Tenant>("/api/tenant", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function uploadLogo(file: File): Promise<{ logoUrl: string }> {
  const form = new FormData();
  form.append("image", file);
  return apiFetch("/api/tenant/logo", { method: "POST", body: form });
}

export function uploadBanner(file: File): Promise<{ bannerUrl: string }> {
  const form = new FormData();
  form.append("image", file);
  return apiFetch("/api/tenant/banner", { method: "POST", body: form });
}
