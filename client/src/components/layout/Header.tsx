import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/uiStore";
import { SidebarContent } from "./SidebarContent";

export function Header() {
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:hidden">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <Menu className="size-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <ShoppingBag className="size-5 text-primary" />
        <span className="font-semibold tracking-tight">Catálogo</span>
      </div>
    </header>
  );
}
