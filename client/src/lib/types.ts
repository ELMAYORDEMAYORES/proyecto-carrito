export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type TenantStatus = "PENDING" | "ACTIVE" | "REJECTED";
export type UserRole = "SUPER_ADMIN" | "OWNER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string | null;
  tenantSlug?: string | null;
}

export interface TenantConfig {
  showPhone: boolean;
  showAddress: boolean;
  showEmail: boolean;
  showDescription: boolean;
  showSlogan: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  description: string;
  slogan: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: TenantStatus;
  rejectionReason: string | null;
  config: TenantConfig;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryId: string | null;
  categoryName: string;
  status: ProductStatus;
  trackInventory: boolean;
  stock: number;
  images: string[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface PublicStore {
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description?: string;
  slogan?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  status: TenantStatus;
  rejectionReason: string | null;
  productCount: number;
  orderCount: number;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  pending: number;
  active: number;
  rejected: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categoryName: string;
  trackInventory: boolean;
  stock: number;
  images: string[];
}

export interface OrderConfirmation {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListResponse<T> {
  items: T[];
}
