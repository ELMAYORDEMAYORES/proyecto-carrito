import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockProducts, formatPrice } from "@/lib/mockData";
import { useCartStore } from "@/stores/cartStore";

export default function ProductDetail() {
  const { slug, id } = useParams();
  const product = mockProducts.find(
    (p) => p.id === id && p.status === "ACTIVE"
  );
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container mx-auto flex min-h-svh items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Producto no encontrado</h1>
          <Button variant="outline" asChild className="mt-4">
            <Link to={`/tienda/${slug}`}>Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  const maxStock = product.trackInventory ? product.stock : 99;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0],
      quantity,
      stock: product.stock,
      tenantSlug: slug ?? "",
    });
  };

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Button variant="ghost" asChild className="mb-6 -ml-2">
          <Link to={`/tienda/${slug}`}>
            <ArrowLeft className="mr-2 size-4" />
            Volver al catálogo
          </Link>
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Badge variant="secondary">{product.categoryName}</Badge>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-lg font-semibold tabular-nums">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                  disabled={product.trackInventory && quantity >= product.stock}
                >
                  <Plus className="size-4" />
                </Button>
                {product.trackInventory && (
                  <span className="text-sm text-muted-foreground">
                    {product.stock} disponibles
                  </span>
                )}
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.trackInventory && product.stock === 0}
              >
                <ShoppingCart className="mr-2 size-5" />
                {product.trackInventory && product.stock === 0
                  ? "Sin stock"
                  : `Agregar al carrito — ${formatPrice(product.price * quantity)}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
