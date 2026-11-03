import { useState } from "react";
import { Link } from "react-router";
import { Download, Eye, PackageOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listOrders, exportOrdersCsv } from "@/api/orders";
import { formatPrice, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const statusTabs: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default function OrdersList() {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", filter],
    queryFn: () =>
      listOrders({ status: filter === "ALL" ? undefined : filter }),
  });

  const orders = data?.items ?? [];

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportOrdersCsv();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gestiona los pedidos de tus clientes."
        action={{
          label: exporting ? "Exportando..." : "Exportar CSV",
          icon: Download,
          onClick: handleExportCSV,
        }}
      />

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as OrderStatus | "ALL")}
      >
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No hay pedidos"
          description={
            filter === "ALL"
              ? "Todavía no recibiste ningún pedido."
              : `No tienes pedidos en estado "${statusTabs.find((t) => t.value === filter)?.label.toLowerCase()}".`
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {order.customerEmail}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/dashboard/pedidos/${order.id}`}>
                        <Eye className="size-4" />
                        <span className="sr-only">Ver pedido {order.id}</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
