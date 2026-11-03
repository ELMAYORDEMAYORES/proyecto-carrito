import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  User,
  FileText,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrder, updateOrderStatus } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id ?? ""),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id ?? "", status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (isLoading) {
    return <LoadingSkeleton variant="form" />;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/pedidos">
            <ArrowLeft className="mr-2 size-4" />
            Volver a pedidos
          </Link>
        </Button>
        <p className="text-muted-foreground">Pedido no encontrado.</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    mutation.mutate(newStatus);
    setConfirmOpen(false);
    setCancelOpen(false);
  };

  const statusActions: Record<
    OrderStatus,
    { label: string; icon: typeof CheckCircle2; nextStatus: OrderStatus } | null
  > = {
    PENDING: { label: "Confirmar pedido", icon: CheckCircle2, nextStatus: "CONFIRMED" },
    CONFIRMED: { label: "Marcar como entregado", icon: Truck, nextStatus: "DELIVERED" },
    DELIVERED: null,
    CANCELLED: null,
  };

  const currentAction = statusActions[order.status];

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link to="/dashboard/pedidos">
          <ArrowLeft className="mr-2 size-4" />
          Volver a pedidos
        </Link>
      </Button>

      <PageHeader
        title={`Pedido ${order.id.slice(0, 8)}`}
        description={`Recibido el ${formatDate(order.createdAt)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Productos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.productId}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatPrice(item.productPrice)}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPrice(item.productPrice * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t border-border px-4 py-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-semibold">{formatPrice(order.total)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusBadge status={order.status} className="w-fit" />

              {currentAction && (
                <Button
                  className="w-full"
                  disabled={mutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  <currentAction.icon className="mr-2 size-4" />
                  {currentAction.label}
                </Button>
              )}

              {order.status !== "CANCELLED" && (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={mutation.isPending}
                  onClick={() => setCancelOpen(true)}
                >
                  <XCircle className="mr-2 size-4" />
                  Cancelar pedido
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="size-4 text-muted-foreground shrink-0" />
                <span>{order.customerName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-primary hover:underline truncate"
                >
                  {order.customerEmail}
                </a>
              </div>
              {order.customerPhone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              )}
              {order.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3 text-sm">
                    <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{order.notes}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={currentAction?.label ?? "Cambiar estado"}
        description={`¿Confirmas que quieres cambiar el estado del pedido a "${currentAction?.nextStatus === "CONFIRMED" ? "Confirmado" : "Entregado"}"?`}
        confirmText="Confirmar"
        variant="warning"
        onConfirm={() => currentAction && handleStatusChange(currentAction.nextStatus)}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar pedido"
        description="¿Estás seguro de que quieres cancelar este pedido? Esta acción no se puede deshacer."
        confirmText="Cancelar pedido"
        variant="danger"
        onConfirm={() => handleStatusChange("CANCELLED")}
      />
    </div>
  );
}
