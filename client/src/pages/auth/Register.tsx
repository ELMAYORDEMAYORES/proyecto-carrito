import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Store } from "lucide-react";
import { useState, useCallback } from "react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z
  .object({
    businessName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    slug: z
      .string()
      .min(3, "El slug debe tener al menos 3 caracteres")
      .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
    ownerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.literal(true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      slug: "",
      ownerName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: undefined,
    },
  });

  const handleBusinessNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue("businessName", value);
      const currentSlug = watch("slug");
      if (!currentSlug || currentSlug === slugify(value)) {
        setValue("slug", slugify(value));
      }
    },
    [setValue, watch]
  );

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    navigate("/login");
  };

  return (
    <AuthCard
      title="Registrar negocio"
      description="Crea tu tienda online en segundos."
      footer={
        <p>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Iniciar sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="businessName">Nombre del negocio</Label>
          <Input
            id="businessName"
            placeholder="Mi Tienda"
            onChange={handleBusinessNameChange}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive">{errors.businessName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            URL de tu tienda
            <span className="ml-1 text-xs text-muted-foreground">
              catálogo.app/tienda/{watch("slug") || "mi-tienda"}
            </span>
          </Label>
          <Input id="slug" placeholder="mi-tienda" {...register("slug")} />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName">Tu nombre</Label>
          <Input id="ownerName" placeholder="María García" {...register("ownerName")} />
          {errors.ownerName && (
            <p className="text-sm text-destructive">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repetí tu contraseña"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border p-4">
          <Checkbox id="acceptTerms" {...register("acceptTerms")} className="mt-0.5" />
          <div className="grid gap-1">
            <label
              htmlFor="acceptTerms"
              className="cursor-pointer text-sm font-normal leading-relaxed"
            >
              Acepto los{" "}
              <a href="#" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                términos y condiciones
              </a>
              {" "}y la{" "}
              <a href="#" className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                política de privacidad
              </a>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Store className="mr-2 size-4" />
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>
    </AuthCard>
  );
}
