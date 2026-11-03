import { useAuthStore } from "@/stores/authStore";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401 || res.status === 403) {
      useAuthStore.getState().setUnauthenticated();
      return null;
    }
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = useAuthStore.getState().accessToken;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const buildHeaders = (token?: string): Headers => {
    const headers = new Headers(options.headers);
    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const doFetch = (token?: string) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: buildHeaders(token),
    });

  let res = await doFetch(accessToken ?? undefined);

  if (res.status === 401 && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      useAuthStore.getState().setAccessToken(newToken);
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    let message = "Error de red";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // respuesta no-JSON, mantener mensaje genérico
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
