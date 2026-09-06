import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams } from "react-router";
import { ArrowLeft, Save, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockProducts,
  mockCategories,
  type ProductStatus,
} from "@/lib/mockData";

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+(?:-[a-z0-9]+)*$/, "Formato inválido"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
  categoryId: z.string().min(1, "Seleccioná una categoría"),
  status: z.enum(["ACTIVE", "INACTIVE"] as const),
  trackInventory: z.boolean(),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo").optional(),
});

type ProductFormValues = z.input<typeof productSchema>;

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const existingProduct = id
    ? mockProducts.find((p) => p.id === id)
    : undefined;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: existingProduct
      ? {
          name: existingProduct.name,
          slug: existingProduct.slug,
          description: existingProduct.description,
          price: existingProduct.price,
          categoryId: existingProduct.categoryId,
          status: existingProduct.status === "ARCHIVED" ? "INACTIVE" : existingProduct.status,
          trackInventory: existingProduct.trackInventory,
          stock: existingProduct.stock,
        }
      : {
          name: "",
          slug: "",
          description: "",
          price: 0,
          categoryId: "",
          status: "ACTIVE",
          trackInventory: false,
          stock: 0,
        },
  });

  const trackInventory = watch("trackInventory");

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    window.history.back();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link to="/dashboard/productos">
          <ArrowLeft className="mr-2 size-4" />
          Volver a productos
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">Info general</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6 space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto</Label>
              <Input
                id="name"
                placeholder="Auriculares Bluetooth Pro"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                placeholder="auriculares-bluetooth-pro"
                {...register("slug")}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu producto..."
                rows={4}
                {...register("description")}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="9990"
                  {...register("price")}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as ProductStatus)}
                  >
                    <SelectTrigger id="status" className="w-full sm:w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="trackInventory" className="text-base">
                  Controlar inventario
                </Label>
                <p className="text-sm text-muted-foreground">
                  Activa esta opción para llevar control de stock.
                </p>
              </div>
              <Controller
                name="trackInventory"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="trackInventory"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {trackInventory && (
              <div className="space-y-2">
                <Label htmlFor="stock">Cantidad en stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="w-full sm:w-[200px]"
                  {...register("stock")}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive">
                    {errors.stock.message}
                  </p>
                )}
              </div>
            )}

            {!trackInventory && (
              <p className="text-sm text-muted-foreground">
                El inventario está desactivado. Los clientes siempre podrán
                comprar este producto sin límite de stock.
              </p>
            )}
          </TabsContent>

          <TabsContent value="images" className="mt-6 space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {existingProduct?.images.map((url, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={url}
                      alt={`${existingProduct.name} - imagen ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="size-8" />
                  <span className="text-sm">Agregar imagen</span>
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos aceptados: JPG, PNG, WebP. Tamaño máximo: 5MB por imagen.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 size-4" />
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/dashboard/productos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
