import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  Search,
  PackageOpen,
  Pencil,
  Archive,
  RotateCcw,
  ImageIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
import { listProducts, updateProduct } from "@/api/products";
import { listCategories } from "@/api/categories";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/types";

export default function ProductsList() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", categoryFilter, statusFilter],
    queryFn: () =>
      listProducts({
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      }),
  });

  const archiveMutation = useMutation({
    mutationFn: (vars: { id: string; status: ProductStatus }) =>
      updateProduct(vars.id, { status: vars.status }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const categories = categoriesData?.items ?? [];
  const products = (data?.items ?? []).filter(
    (p) => !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de tu tienda."
        action={{
          label: "Nuevo producto",
          icon: Plus,
          onClick: () => navigate("/dashboard/productos/nuevo"),
        }}
      />

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
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ProductStatus | "ALL")}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="INACTIVE">Inactivos</SelectItem>
            <SelectItem value="ARCHIVED">Archivados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="card-grid" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No se encontraron productos"
          description={
            search || categoryFilter !== "ALL" || statusFilter !== "ALL"
              ? "Prueba con otros filtros de búsqueda."
              : "Todavía no creaste ningún producto. Empieza agregando el primero."
          }
          action={
            !search && categoryFilter === "ALL" && statusFilter === "ALL"
              ? {
                  label: "Crear producto",
                  onClick: () => navigate("/dashboard/productos/nuevo"),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={cn(
                "group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md",
                product.status !== "ACTIVE" && "opacity-60"
              )}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
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
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <StatusBadge status={product.status} className="shrink-0" />
                </div>
                {product.categoryName && (
                  <Badge variant="secondary" className="text-xs">
                    {product.categoryName}
                  </Badge>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {formatPrice(product.price)}
                  </span>
                  {product.trackInventory && (
                    <span
                      className={cn(
                        "text-xs",
                        product.stock === 0
                          ? "text-destructive"
                          : product.stock <= 5
                            ? "text-warning"
                            : "text-muted-foreground"
                      )}
                    >
                      {product.stock === 0
                        ? "Sin stock"
                        : `${product.stock} en stock`}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/dashboard/productos/${product.id}/editar`}>
                      <Pencil className="mr-1.5 size-3.5" />
                      Editar
                    </Link>
                  </Button>
                  {product.status !== "ARCHIVED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={archiveMutation.isPending}
                      onClick={() =>
                        archiveMutation.mutate({ id: product.id, status: "ARCHIVED" })
                      }
                    >
                      <Archive className="mr-1.5 size-3.5" />
                      Archivar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={archiveMutation.isPending}
                      onClick={() =>
                        archiveMutation.mutate({ id: product.id, status: "ACTIVE" })
                      }
                    >
                      <RotateCcw className="mr-1.5 size-3.5" />
                      Reactivar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
