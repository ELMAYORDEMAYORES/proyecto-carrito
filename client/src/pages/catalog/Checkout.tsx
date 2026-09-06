import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams } from "react-router";
import { ArrowLeft, Send, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/mockData";

const checkoutSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutForm = z.input<typeof checkoutSchema>;

export default function Checkout() {
  const { slug } = useParams();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    clearCart();
    setSubmitted(true);
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="container mx-auto flex min-h-svh flex-col items-center justify-center px-4">
        <ShoppingBag className="size-12 text-muted-foreground/30" />
        <h1 className="mt-6 text-2xl font-bold">Carrito vacío</h1>
        <p className="mt-2 text-muted-foreground">
          Agrega productos antes de hacer un pedido.
        </p>
        <Button asChild className="mt-6">
          <Link to={`/tienda/${slug}`}>Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto flex min-h-svh flex-col items-center justify-center px-4">
        <CheckCircle2 className="size-16 text-success" />
        <h1 className="mt-6 text-2xl font-bold">Pedido recibido</h1>
        <p className="mt-2 text-center text-muted-foreground max-w-md">
          Tu pedido fue enviado. El vendedor se pondrá en contacto a la brevedad.
        </p>
        <Button asChild className="mt-8">
          <Link to={`/tienda/${slug}`}>Volver al catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to={`/tienda/${slug}`}>
            <ArrowLeft className="mr-2 size-4" />
            Volver al catálogo
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Confirmar pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completá tus datos para que el vendedor pueda contactarte.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 lg:col-span-3"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tus datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    placeholder="Carlos López"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="carlos@email.com"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Teléfono{" "}
                      <span className="text-muted-foreground">(opcional)</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+54 11 5555-0000"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notas{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Instrucciones especiales para tu pedido..."
                    rows={3}
                    {...register("notes")}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              <Send className="mr-2 size-5" />
              {isSubmitting ? "Enviando pedido..." : "Realizar pedido"}
            </Button>
          </form>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
