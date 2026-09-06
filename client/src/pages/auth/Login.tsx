import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "vendedor@demo.com", password: "", rememberMe: false },
  });

  const onSubmit = async (_data: LoginForm) => {
    await new Promise((r) => setTimeout(r, 500));
    login(
      {
        id: "mock-user-001",
        email: _data.email,
        name: "María García",
        role: "OWNER",
        tenantId: "mock-tenant-001",
        tenantSlug: "mi-tienda",
      },
      "mock-access-token"
    );
    navigate("/dashboard/pedidos");
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      description="Ingresa a tu cuenta para gestionar tu catálogo."
      footer={
        <p>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Regístrate gratis
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
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

        <div className="flex items-center gap-2">
          <Checkbox id="rememberMe" {...register("rememberMe")} />
          <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
            Recordarme
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <LogIn className="mr-2 size-4" />
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </AuthCard>
  );
}
