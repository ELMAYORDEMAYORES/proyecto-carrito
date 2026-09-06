import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "El email es obligatorio").email("Email inválido"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    await new Promise((r) => setTimeout(r, 800));
    setSentEmail(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard title="Email enviado">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <p className="text-muted-foreground">
            Te enviamos un link de recuperación a{" "}
            <span className="font-medium text-foreground">{sentEmail}</span>.
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Button variant="outline" asChild className="mt-2">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Te enviaremos un link para restablecer tu contraseña."
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Mail className="mr-2 size-4" />
          {isSubmitting ? "Enviando..." : "Enviar link de recuperación"}
        </Button>
      </form>
    </AuthCard>
  );
}
