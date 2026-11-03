import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  ImagePlus,
  X,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { listCategories } from "@/api/categories";
import {
  getProduct,
  createProduct,
  updateProduct,
  addProductImages,
  removeProductImage,
  type CreateProductInput,
} from "@/api/products";
import type { ProductStatus } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional(),
  price: z.number().min(0, "El precio no puede ser negativo"),
  categoryId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  trackInventory: z.boolean(),
  stock: z.number().int().min(0, "El stock no puede ser negativo").optional(),
});

type ProductFormValues = z.input<typeof productSchema>;

interface NewImage {
  file: File;
  preview: string;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data: existingProduct, isLoading: loadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id ?? ""),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      status: "ACTIVE",
      trackInventory: false,
      stock: 0,
    },
  });

  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        categoryId: existingProduct.categoryId ?? "",
        status:
          existingProduct.status === "ARCHIVED"
            ? "INACTIVE"
            : existingProduct.status,
        trackInventory: existingProduct.trackInventory,
        stock: existingProduct.stock,
      });
      setExistingImages(existingProduct.images);
    }
  }, [existingProduct, reset]);

  const categories = categoriesData?.items ?? [];
  const trackInventory = watch("trackInventory");

  const saveMutation = useMutation({
    mutationFn: async (input: CreateProductInput) => {
      let productId: string;
      if (isEditing && id) {
        const updated = await updateProduct(id, input);
        productId = updated.id;
      } else {
        const created = await createProduct(input);
        productId = created.id;
      }
      if (newImages.length > 0) {
        await addProductImages(
          productId,
          newImages.map((i) => i.file)
        );
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/dashboard/productos");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (filename: string) =>
      removeProductImage(id ?? "", filename),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 5 - existingImages.length - newImages.length);
    setNewImages((prev) => [
      ...prev,
      ...list.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleRemoveNew = (index: number) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExisting = (url: string) => {
    const filename = url.split("/").pop();
    if (filename) {
      removeMutation.mutate(filename);
      setExistingImages((prev) => prev.filter((u) => u !== url));
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    saveMutation.mutate({
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      categoryId: data.categoryId || null,
      trackInventory: data.trackInventory,
      stock: data.stock ?? 0,
      status: data.status,
    });
  };

  if (isEditing && loadingProduct) {
    return <LoadingSkeleton variant="form" />;
  }

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
                  step="0.01"
                  placeholder="89.99"
                  {...register("price", { valueAsNumber: true })}
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
                      value={field.value || "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin categoría</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
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
                  {...register("stock", { valueAsNumber: true })}
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
                {existingImages.map((url) => (
                  <div
                    key={url}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={url}
                      alt="Imagen del producto"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExisting(url)}
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                {newImages.map((img, i) => (
                  <div
                    key={img.preview}
                    className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <img
                      src={img.preview}
                      alt="Nueva imagen"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNew(i)}
                      className="absolute right-2 top-2 rounded-md bg-background/80 p-1"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}

                <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <ImagePlus className="size-8" />
                  <span className="text-sm">Agregar imagen</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos aceptados: JPG, PNG, WebP. Máximo 2MB y 5 imágenes por
                producto.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {saveMutation.isPending
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
