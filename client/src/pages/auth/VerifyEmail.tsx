import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { AuthCard } from "@/components/shared/AuthCard";
import { Button } from "@/components/ui/button";

type VerifyState = "loading" | "success" | "error";

export default function VerifyEmail() {
  const { token } = useParams();
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    const timer = setTimeout(() => {
      setState(token && token.length > 3 ? "success" : "error");
    }, 1500);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <AuthCard title="Verificación de email">
      {state === "loading" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando tu email...</p>
        </div>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <div>
            <p className="font-medium text-foreground">Email verificado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu cuenta fue activada. Ya puedes iniciar sesión.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <XCircle className="size-12 text-destructive" />
          <div>
            <p className="font-medium text-foreground">Token inválido o expirado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              El link de verificación no es válido o ya fue usado. Solicita uno nuevo.
            </p>
          </div>
          <Button variant="outline" asChild className="mt-2">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      )}
    </AuthCard>
  );
}
