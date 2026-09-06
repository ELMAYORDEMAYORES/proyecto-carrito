import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Upload, ExternalLink, Store } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
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
import { mockTenant } from "@/lib/mockData";

const settingsSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+(?:-[a-z0-9]+)*$/, "Formato inválido"),
  description: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  address: z.string().optional(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showAddress: z.boolean(),
  showDescription: z.boolean(),
});

type SettingsForm = z.input<typeof settingsSchema>;

export default function Settings() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: mockTenant.name,
      slug: mockTenant.slug,
      description: mockTenant.description,
      email: mockTenant.email,
      phone: mockTenant.phone,
      address: mockTenant.address,
      showEmail: mockTenant.config.showEmail,
      showPhone: mockTenant.config.showPhone,
      showAddress: mockTenant.config.showAddress,
      showDescription: mockTenant.config.showDescription,
    },
  });

  const watchAll = watch();

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Personaliza los datos de tu negocio."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identidad visual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="size-20 rounded-lg">
                  <AvatarImage src={mockTenant.logoUrl ?? undefined} />
                  <AvatarFallback className="rounded-lg bg-muted text-2xl">
                    <Store className="size-8 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 size-4" />
                  Subir logo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Recomendado: 256x256px. PNG o SVG con fondo transparente.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Banner</Label>
              <div className="aspect-[3/1] w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
                {mockTenant.bannerUrl ? (
                  <img
                    src={mockTenant.bannerUrl}
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
              <Button type="button" variant="outline" size="sm">
                <Upload className="mr-2 size-4" />
                Subir banner
              </Button>
              <p className="text-xs text-muted-foreground">
                Recomendado: 1200x400px. JPG o PNG.
              </p>
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
                  href={`/tienda/${watchAll.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                catálogo.app/tienda/{watchAll.slug || "mi-tienda"}
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

        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 size-4" />
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  );
}
