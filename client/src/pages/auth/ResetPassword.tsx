import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useParams } from "react-router";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSuccess(true);
  };

  if (success) {
    return (
      <AuthCard title="Contraseña actualizada">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-muted-foreground">
            Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión.
          </p>
          <Button asChild className="mt-2">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Restablecer contraseña"
      description={`Token: ${token?.slice(0, 12)}...`}
      footer={
        <p>
          <Link to="/login" className="font-medium text-primary hover:underline">
            ← Volver al inicio de sesión
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
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
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repetí tu contraseña"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <LockKeyhole className="mr-2 size-4" />
          {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </form>
    </AuthCard>
  );
}
