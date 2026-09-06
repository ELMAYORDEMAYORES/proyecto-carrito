import { create } from "zustand";

export type UserRole = "SUPER_ADMIN" | "OWNER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenantSlug?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "mock-user-001",
    email: "vendedor@demo.com",
    name: "María García",
    role: "OWNER",
    tenantId: "mock-tenant-001",
    tenantSlug: "mi-tienda",
  },
  accessToken: "mock-access-token",
  isAuthenticated: true,
  login: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
