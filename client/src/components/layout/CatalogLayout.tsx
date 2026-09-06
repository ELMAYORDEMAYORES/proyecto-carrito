import { Outlet } from "react-router";
import { CartFloatingButton } from "@/components/cart/CartFloatingButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function CatalogLayout() {
  return (
    <>
      <Outlet />
      <CartFloatingButton />
      <CartDrawer />
    </>
  );
}
