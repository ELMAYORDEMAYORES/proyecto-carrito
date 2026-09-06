import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";

export function CartFloatingButton() {
  const itemCount = useCartStore((s) => s.getItemCount());
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="lg"
        className="relative h-14 w-14 rounded-full shadow-lg"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingCart className="size-6" />
        <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
          {itemCount}
        </span>
      </Button>
    </div>
  );
}
