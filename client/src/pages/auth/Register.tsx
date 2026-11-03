import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { Eye, EyeOff, Store, AlertCircle, MailCheck } from "lucide-react";
import { useState, useCallback } from "react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { register as registerUser } from "@/api/auth";
import { ApiError } from "@/lib/api";

const registerSchema = z
  .object({
    businessName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    slug: z
      .string()
      .min(3, "El slug debe tener al menos 3 caracteres")
      .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
    ownerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
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

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      await registerUser({
        name: data.ownerName,
        email: data.email,
        password: data.password,
        storeName: data.businessName,
        storeSlug: data.slug || undefined,
      });
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error al crear la cuenta"
      );
    }
  };

  if (success) {
    return (
      <AuthCard title="Revisa tu email">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <MailCheck className="size-12 text-success" />
          <p className="text-muted-foreground">
            Te enviamos un link de verificación a{" "}
            <span className="font-medium text-foreground">{registeredEmail}</span>.
            Confirma tu cuenta para poder iniciar sesión.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link to="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

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
        {error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="acceptTerms"
                checked={field.value === true}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                className="mt-0.5"
              />
            )}
          />
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
