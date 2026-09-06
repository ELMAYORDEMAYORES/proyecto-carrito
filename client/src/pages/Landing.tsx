import { Link } from "react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <ShoppingBag className="size-5 text-primary" />
            Catálogo
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <ShoppingBag className="size-40 text-primary/10 md:size-60" strokeWidth={1} />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Negocio Online
            </h1>
            <p className="mx-auto max-w-lg text-lg text-muted-foreground md:text-xl">
              Crea tu catálogo online en minutos.
              <br />
              Sin comisiones, sin límites.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link to="/register">
                <ShoppingBag className="mr-2 size-5" />
                Crear tienda gratis
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link to="/login">
                Iniciar sesión
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Catálogo</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Términos
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Privacidad
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contacto
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
