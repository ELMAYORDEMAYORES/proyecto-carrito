import { type ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <ShoppingBag className="size-8 text-primary" />
        <span className="text-xl font-bold tracking-tight">Catálogo</span>
      </div>
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <div className="border-t border-border px-6 py-4 text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
}
