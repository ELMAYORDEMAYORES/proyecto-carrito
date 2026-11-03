import { apiFetch } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/lib/types";

interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  storeName: string;
  storeSlug?: string;
}

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  queryClient.clear();
  useAuthStore.getState().setAuth(data.user, data.accessToken);
  return data.user;
}

export async function register(
  input: RegisterInput
): Promise<{ message: string }> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  password: string
): Promise<{ message: string }> {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } finally {
    queryClient.clear();
    useAuthStore.getState().setUnauthenticated();
  }
}

let restorePromise: Promise<void> | null = null;

export function restoreSession(): Promise<void> {
  if (!restorePromise) {
    restorePromise = doRestoreSession().finally(() => {
      restorePromise = null;
    });
  }
  return restorePromise;
}

async function doRestoreSession(): Promise<void> {
  try {
    const { accessToken } = await apiFetch<{ accessToken: string }>(
      "/api/auth/refresh",
      { method: "POST" }
    );
    useAuthStore.getState().setAccessToken(accessToken);
    const user = await apiFetch<User>("/api/auth/me");
    useAuthStore.getState().setAuth(user, accessToken);
  } catch {
    useAuthStore.getState().setUnauthenticated();
  }
}
