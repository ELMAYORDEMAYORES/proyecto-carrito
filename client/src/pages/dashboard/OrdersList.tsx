import { useState } from "react";
import { Link } from "react-router";
import { Download, Eye, PackageOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
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
import {
  mockOrders,
  formatPrice,
  formatDate,
  type OrderStatus,
} from "@/lib/mockData";

const statusTabs: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default function OrdersList() {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");

  const filteredOrders =
    filter === "ALL"
      ? mockOrders
      : mockOrders.filter((o) => o.status === filter);

  const handleExportCSV = () => {
    const header = "ID,Cliente,Email,Teléfono,Estado,Total,Fecha\n";
    const rows = filteredOrders
      .map((o) =>
        [
          o.id,
          o.customerName,
          o.customerEmail,
          o.customerPhone ?? "",
          o.status,
          o.total,
          o.createdAt,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Gestiona los pedidos de tus clientes."
        action={{ label: "Exportar CSV", icon: Download, onClick: handleExportCSV }}
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

      {filteredOrders.length === 0 ? (
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
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id}
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
