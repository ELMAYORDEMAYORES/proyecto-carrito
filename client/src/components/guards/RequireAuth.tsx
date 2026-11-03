import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { restoreSession } from "@/api/auth";

function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  useEffect(() => {
    if (status === "loading") {
      void restoreSession();
    }
  }, [status]);

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: RequireAuthProps) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  useEffect(() => {
    if (status === "loading") {
      void restoreSession();
    }
  }, [status]);

  if (status === "loading") {
    return <FullScreenLoader />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/dashboard/pedidos" replace />;
  }

  return <>{children}</>;
}
