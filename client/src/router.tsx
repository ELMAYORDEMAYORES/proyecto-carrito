import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CatalogLayout } from "@/components/layout/CatalogLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: () => import("@/pages/Landing").then((m) => ({ Component: m.default })),
  },
  {
    path: "/login",
    lazy: () => import("@/pages/auth/Login").then((m) => ({ Component: m.default })),
  },
  {
    path: "/register",
    lazy: () => import("@/pages/auth/Register").then((m) => ({ Component: m.default })),
  },
  {
    path: "/forgot-password",
    lazy: () => import("@/pages/auth/ForgotPassword").then((m) => ({ Component: m.default })),
  },
  {
    path: "/reset-password/:token",
    lazy: () => import("@/pages/auth/ResetPassword").then((m) => ({ Component: m.default })),
  },
  {
    path: "/verify-email/:token",
    lazy: () => import("@/pages/auth/VerifyEmail").then((m) => ({ Component: m.default })),
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard/pedidos",
        lazy: () => import("@/pages/dashboard/OrdersList").then((m) => ({ Component: m.default })),
      },
      {
        path: "/dashboard/pedidos/:id",
        lazy: () => import("@/pages/dashboard/OrderDetail").then((m) => ({ Component: m.default })),
      },
      {
        path: "/dashboard/productos",
        lazy: () => import("@/pages/dashboard/ProductsList").then((m) => ({ Component: m.default })),
      },
      {
        path: "/dashboard/productos/nuevo",
        lazy: () => import("@/pages/dashboard/ProductForm").then((m) => ({ Component: m.default })),
      },
      {
        path: "/dashboard/productos/:id/editar",
        lazy: () => import("@/pages/dashboard/ProductForm").then((m) => ({ Component: m.default })),
      },
      {
        path: "/dashboard/configuracion",
        lazy: () => import("@/pages/dashboard/Settings").then((m) => ({ Component: m.default })),
      },
      {
        path: "/admin/negocios",
        lazy: () => import("@/pages/admin/TenantsList").then((m) => ({ Component: m.default })),
      },
    ],
  },
  {
    element: <CatalogLayout />,
    children: [
      {
        path: "/tienda/:slug",
        lazy: () => import("@/pages/catalog/CatalogGrid").then((m) => ({ Component: m.default })),
      },
      {
        path: "/tienda/:slug/producto/:id",
        lazy: () => import("@/pages/catalog/ProductDetail").then((m) => ({ Component: m.default })),
      },
      {
        path: "/tienda/:slug/checkout",
        lazy: () => import("@/pages/catalog/Checkout").then((m) => ({ Component: m.default })),
      },
    ],
  },
]);
