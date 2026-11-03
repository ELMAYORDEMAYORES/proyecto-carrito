import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import {
  Search,
  ShoppingCart,
  PackageOpen,
  Store,
  Phone,
  Mail,
  MapPin,
  ImageIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getStore,
  listCatalogCategories,
  listCatalogProducts,
} from "@/api/catalog";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";

export default function CatalogGrid() {
  const { slug = "" } = useParams();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["catalog-store", slug],
    queryFn: () => getStore(slug),
    enabled: Boolean(slug),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["catalog-categories", slug],
    queryFn: () => listCatalogCategories(slug),
    enabled: Boolean(slug),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["catalog-products", slug, categoryFilter, debouncedSearch],
    queryFn: () =>
      listCatalogProducts(slug, {
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        search: debouncedSearch || undefined,
      }),
    enabled: Boolean(slug),
  });

  const categories = categoriesData?.items ?? [];
  const products = productsData?.items ?? [];

  if (storeLoading) {
    return <LoadingSkeleton variant="card-grid" />;
  }

  if (!store) {
    return (
      <div className="min-h-svh bg-background">
        <div className="container mx-auto flex min-h-svh items-center justify-center px-4">
          <EmptyState
            icon={PackageOpen}
            title="Tienda no encontrada"
            description="Este negocio no existe o aún no fue aprobado."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-background">
      {store.bannerUrl && (
        <div className="h-40 w-full overflow-hidden md:h-52">
          <img
            src={store.bannerUrl}
            alt={store.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="size-12 rounded-lg object-cover md:size-14"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 md:size-14">
              <Store className="size-6 text-primary md:size-7" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {store.name}
            </h1>
            <p className="text-sm text-muted-foreground">catálogo.app/tienda/{slug}</p>
          </div>
        </div>

        {store.slogan && (
          <p className="mt-3 text-base font-medium text-foreground/80">
            {store.slogan}
          </p>
        )}

        {store.description && (
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
            {store.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {store.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="size-4" />
              <a href={`mailto:${store.email}`} className="hover:text-primary">
                {store.email}
              </a>
            </div>
          )}
          {store.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="size-4" />
              <a href={`tel:${store.phone}`} className="hover:text-primary">
                {store.phone}
              </a>
            </div>
          )}
          {store.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              <span>{store.address}</span>
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {productsLoading ? (
          <div className="mt-6">
            <LoadingSkeleton variant="card-grid" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title="Catálogo vacío"
            description="Esta tienda está preparando su catálogo. ¡Vuelve pronto!"
            className="mt-12"
          />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
              >
                <Link
                  to={`/tienda/${slug}/producto/${product.id}`}
                  className="block aspect-[4/3] w-full overflow-hidden bg-muted"
                >
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground/40" />
                    </div>
                  )}
                </Link>
                <div className="space-y-2 p-3">
                  {product.categoryName && (
                    <Badge variant="secondary" className="text-xs">
                      {product.categoryName}
                    </Badge>
                  )}
                  <Link
                    to={`/tienda/${slug}/producto/${product.id}`}
                    className="block"
                  >
                    <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-primary">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.images[0] ?? "",
                        quantity: 1,
                        stock: product.stock,
                        tenantSlug: slug,
                      })
                    }
                    disabled={product.trackInventory && product.stock === 0}
                  >
                    <ShoppingCart className="mr-1.5 size-4" />
                    {product.trackInventory && product.stock === 0
                      ? "Sin stock"
                      : "Agregar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
