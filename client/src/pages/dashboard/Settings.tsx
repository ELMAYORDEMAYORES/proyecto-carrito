import { useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Upload, ExternalLink, Store, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getTenant, updateTenant, uploadLogo, uploadBanner } from "@/api/tenant";

const settingsSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+(?:-[a-z0-9]+)*$/, "Formato inválido"),
  description: z.string().optional(),
  slogan: z.string().optional(),
  email: z
    .string()
    .email("Email inválido")
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showAddress: z.boolean(),
  showDescription: z.boolean(),
  showSlogan: z.boolean(),
});

type SettingsForm = z.input<typeof settingsSchema>;

export default function Settings() {
  const queryClient = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["tenant"],
    queryFn: getTenant,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      slogan: "",
      email: "",
      phone: "",
      address: "",
      showEmail: true,
      showPhone: true,
      showAddress: true,
      showDescription: true,
      showSlogan: true,
    },
  });

  useEffect(() => {
    if (tenant) {
      reset({
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description,
        slogan: tenant.slogan,
        email: tenant.email,
        phone: tenant.phone,
        address: tenant.address,
        showEmail: tenant.config.showEmail,
        showPhone: tenant.config.showPhone,
        showAddress: tenant.config.showAddress,
        showDescription: tenant.config.showDescription,
        showSlogan: tenant.config.showSlogan,
      });
    }
  }, [tenant, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: SettingsForm) =>
      updateTenant({
        name: data.name,
        slug: data.slug,
        description: data.description ?? "",
        slogan: data.slogan ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        config: {
          showEmail: data.showEmail,
          showPhone: data.showPhone,
          showAddress: data.showAddress,
          showDescription: data.showDescription,
          showSlogan: data.showSlogan,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  const logoMutation = useMutation({
    mutationFn: (file: File) => uploadLogo(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  const bannerMutation = useMutation({
    mutationFn: (file: File) => uploadBanner(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tenant"] });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton variant="form" />;
  }

  const watchSlug = watch("slug");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Personaliza los datos de tu negocio."
      />

      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identidad visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-20 rounded-lg">
                  <AvatarImage src={tenant?.logoUrl ?? undefined} />
                  <AvatarFallback className="rounded-lg bg-muted text-2xl">
                    <Store className="size-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={logoMutation.isPending}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoMutation.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 size-4" />
                  )}
                  Subir logo
                </Button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) logoMutation.mutate(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Banner</Label>
              <div className="aspect-[3/1] w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
                {tenant?.bannerUrl ? (
                  <img
                    src={tenant.bannerUrl}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="size-8" />
                    <span className="text-sm">Sin banner</span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bannerMutation.isPending}
                onClick={() => bannerInputRef.current?.click()}
              >
                {bannerMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                Subir banner
              </Button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) bannerMutation.mutate(f);
                  e.target.value = "";
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del negocio</Label>
              <Input id="name" placeholder="Mi Tienda" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL pública</Label>
              <div className="flex items-center gap-2">
                <Input id="slug" placeholder="mi-tienda" {...register("slug")} />
                <a
                  href={`/tienda/${watchSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                catálogo.app/tienda/{watchSlug || "mi-tienda"}
              </p>
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu negocio..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">Eslogan</Label>
              <Input
                id="slogan"
                placeholder="El mejor lugar para comprar"
                {...register("slogan")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email de contacto</Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@mitienda.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+54 11 4444-0000"
                {...register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Av. Corrientes 1234, CABA"
                {...register("address")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visibilidad en catálogo público</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-2xl">
            {(
              [
                { key: "showEmail", label: "Mostrar email" },
                { key: "showPhone", label: "Mostrar teléfono" },
                { key: "showAddress", label: "Mostrar dirección" },
                { key: "showDescription", label: "Mostrar descripción" },
                { key: "showSlogan", label: "Mostrar eslogan" },
              ] as const
            ).map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <Label htmlFor={key} className="cursor-pointer text-sm">
                  {label}
                </Label>
                <Controller
                  name={key}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id={key}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {saveMutation.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
