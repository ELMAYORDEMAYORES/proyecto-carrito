import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  mockPendingTenants,
  mockActiveTenants,
  mockRejectedTenants,
  formatDate,
  type TenantStatus,
} from "@/lib/mockData";

export default function TenantsList() {
  const [tab, setTab] = useState<TenantStatus | "ALL">("PENDING");
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [tenantStatuses, setTenantStatuses] = useState<
    Record<string, { status: TenantStatus; rejectionReason?: string }>
  >({});

  const allTenants = [
    ...mockPendingTenants,
    ...mockActiveTenants,
    ...mockRejectedTenants,
  ];

  const resolvedTenants = allTenants.map((t) => ({
    ...t,
    status: tenantStatuses[t.id]?.status ?? t.status,
    rejectionReason: tenantStatuses[t.id]?.rejectionReason ?? t.rejectionReason,
  }));

  const filtered =
    tab === "ALL"
      ? resolvedTenants
      : resolvedTenants.filter((t) => t.status === tab);

  const handleApprove = (tenantId: string) => {
    setTenantStatuses((prev) => ({
      ...prev,
      [tenantId]: { status: "ACTIVE" },
    }));
  };

  const handleReject = (tenantId: string) => {
    setTenantStatuses((prev) => ({
      ...prev,
      [tenantId]: { status: "REJECTED", rejectionReason },
    }));
    setRejectionReason("");
    setRejectOpen(null);
  };

  const tabs: { value: TenantStatus | "ALL"; label: string; count: number }[] = [
    { value: "PENDING", label: "Pendientes", count: mockPendingTenants.length },
    { value: "ACTIVE", label: "Activos", count: mockActiveTenants.length },
    { value: "REJECTED", label: "Rechazados", count: mockRejectedTenants.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Negocios"
        description="Aprobá o rechazá los registros de nuevos negocios."
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TenantStatus | "ALL")}
      >
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs">
                {t.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState
          icon={tab === "PENDING" ? CheckCircle2 : Building2}
          title={
            tab === "PENDING"
              ? "No hay registros pendientes"
              : tab === "ACTIVE"
                ? "No hay negocios activos"
                : "No hay negocios rechazados"
          }
          description={
            tab === "PENDING"
              ? "Todos los registros fueron procesados."
              : "No se encontraron resultados."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{tenant.name}</CardTitle>
                  <StatusBadge status={tenant.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  /tienda/{tenant.slug}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-2">{tenant.description}</p>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5" />
                    {tenant.email}
                  </div>
                  {tenant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5" />
                      {tenant.phone}
                    </div>
                  )}
                  {tenant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5" />
                      {tenant.address}
                    </div>
                  )}
                </div>

                {tenant.status === "REJECTED" && tenant.rejectionReason && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    <p className="font-medium">Motivo de rechazo:</p>
                    <p className="mt-1">{tenant.rejectionReason}</p>
                  </div>
                )}

                {tenant.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(tenant.id)}
                    >
                      <CheckCircle2 className="mr-1.5 size-4" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRejectOpen(tenant.id)}
                    >
                      <XCircle className="mr-1.5 size-4" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {tenant.status === "ACTIVE" && (
                  <div className="flex gap-2 pt-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Activo desde {formatDate("2026-07-20T00:00:00Z").split(",")[0]}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={rejectOpen !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectOpen(null);
            setRejectionReason("");
          }
        }}
        title="Rechazar registro"
        description={
          <div className="mt-2 space-y-2 text-left">
            <Label htmlFor="rejectionReason">Motivo del rechazo</Label>
            <Textarea
              id="rejectionReason"
              placeholder="Explicá por qué se rechaza este registro..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
        }
        confirmText="Rechazar"
        variant="danger"
        onConfirm={() => {
          if (rejectOpen) handleReject(rejectOpen);
        }}
      />
    </div>
  );
}
