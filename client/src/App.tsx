import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export default function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background">
      <div className="flex items-center gap-3">
        <ShoppingBag className="size-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Catálogo SaaS
        </h1>
      </div>
      <p className="text-muted-foreground">
        Monorepo, Tailwind v4, shadcn/ui — todo funcionando.
      </p>
      <Button size="lg">
        <ShoppingBag className="mr-2 size-5" />
        Empezar
      </Button>∑
    </div>
  );
}
