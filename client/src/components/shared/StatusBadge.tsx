import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, ProductStatus, TenantStatus } from "@/lib/mockData";

type StatusType = OrderStatus | ProductStatus | TenantStatus;

const statusConfig: Record<
  StatusType,
  { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline"; Icon: LucideIcon }
> = {
  PENDING: { label: "Pendiente", variant: "warning", Icon: Clock },
  CONFIRMED: { label: "Confirmado", variant: "default", Icon: CheckCircle2 },
  DELIVERED: { label: "Entregado", variant: "success", Icon: Truck },
  CANCELLED: { label: "Cancelado", variant: "destructive", Icon: XCircle },
  ACTIVE: { label: "Activo", variant: "success", Icon: CheckCircle2 },
  INACTIVE: { label: "Inactivo", variant: "warning", Icon: AlertTriangle },
  ARCHIVED: { label: "Archivado", variant: "secondary", Icon: Archive },
  REJECTED: { label: "Rechazado", variant: "destructive", Icon: XCircle },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) return null;

  const { label, variant, Icon } = config;

  const variantClasses: Record<string, string> = {
    default: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    destructive: "bg-red-500/15 text-red-400 border-red-500/30",
    secondary: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    outline: "bg-transparent text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 border font-medium", variantClasses[variant], className)}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </Badge>
  );
}
