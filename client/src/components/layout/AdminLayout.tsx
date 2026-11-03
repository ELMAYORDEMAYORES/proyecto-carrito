import { Outlet } from "react-router";
import { NavLink, useNavigate } from "react-router";
import { Building2, LogOut, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { logout } from "@/api/auth";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-sidebar-accent text-sidebar-foreground border-l-[3px] border-l-primary pl-[9px]"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
  );

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-svh w-64 border-r border-sidebar-border bg-sidebar lg:block">
      <div className="flex h-full flex-col gap-1 p-3">
        <div className="flex items-center gap-2.5 px-3 py-3">
          <ShoppingBag className="size-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            Admin
          </span>
        </div>

        <Separator className="bg-sidebar-border" />

        <nav className="flex flex-1 flex-col gap-1 py-2">
          <NavLink to="/admin/negocios" end className={linkClasses}>
            <Building2 className="size-5 shrink-0" />
            Negocios
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
    </aside>
  );
}

export function AdminLayout() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-svh bg-background">
        <AdminSidebar />
        <main className="lg:pl-64">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
