import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Package, Tags, Settings, LogOut, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { logout } from "@/api/auth";

interface SidebarContentProps {
  onNavigate?: () => void;
}

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-sidebar-accent text-sidebar-foreground border-l-[3px] border-l-primary pl-[9px]"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
  );

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    onNavigate?.();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="flex items-center gap-2.5 px-3 py-3">
        <ShoppingBag className="size-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          Catálogo
        </span>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 py-2">
        <NavLink
          to="/dashboard/pedidos"
          end
          className={linkClasses}
          onClick={handleClick}
        >
          <LayoutDashboard className="size-5 shrink-0" />
          Pedidos
        </NavLink>

        <NavLink
          to="/dashboard/productos"
          className={linkClasses}
          onClick={handleClick}
        >
          <Package className="size-5 shrink-0" />
          Productos
        </NavLink>

        <NavLink
          to="/dashboard/categorias"
          className={linkClasses}
          onClick={handleClick}
        >
          <Tags className="size-5 shrink-0" />
          Categorías
        </NavLink>

        <NavLink
          to="/dashboard/configuracion"
          className={linkClasses}
          onClick={handleClick}
        >
          <Settings className="size-5 shrink-0" />
          Configuración
        </NavLink>
      </nav>

      <Separator className="bg-sidebar-border" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <LogOut className="size-5 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  );
}
