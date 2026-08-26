"use client";

import { useParams } from "react-router-dom";
import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.constants";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import {
  useAdjustmentRequestById,
  useApproveAdjustmentRequest,
  useRejectAdjustmentRequest,
} from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.hook";
import {
  ADJUSTMENT_ACTION_LABEL,
  ADJUSTMENT_STATUS_COLOR,
  ADJUSTMENT_STATUS_LABEL,
  ADJUSTMENT_STATUS_PENDING,
} from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.constants";

export default function AdjustmentRequestDetailPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const { id } = useParams<{ id: string }>();
  const { MODEL } = PURCHASE_REQUEST_QUOTE_ADJUSTMENT;
  // Es una subruta de Solicitudes de Compra: reutiliza el mismo módulo/permisos
  // (no requiere una Vista nueva en el menú).
  const permissions = useModulePermissions(PURCHASE_REQUEST_QUOTE.ROUTE);

  const { data: request, isLoading, refetch } = useAdjustmentRequestById(
    Number(id),
  );
  const approveMutation = useApproveAdjustmentRequest();
  const rejectMutation = useRejectAdjustmentRequest();

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    if (!request) return;
    try {
      await approveMutation.mutateAsync(request.id);
      await refetch();
      successToast("Ajuste aprobado: los bonos/descuentos fueron actualizados.");
    } catch (error: any) {
      errorToast(ERROR_MESSAGE(MODEL, error?.response?.data?.message || ""));
    } finally {
      setApproveOpen(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    try {
      await rejectMutation.mutateAsync({ id: request.id, reason: rejectReason });
      await refetch();
      successToast("Solicitud de ajuste rechazada.");
    } catch (error: any) {
      errorToast(ERROR_MESSAGE(MODEL, error?.response?.data?.message || ""));
    } finally {
      setRejectOpen(false);
      setRejectReason("");
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(PURCHASE_REQUEST_QUOTE.ROUTE)) notFound();
  if (
    !permissions.canViewAdjustments &&
    !permissions.canRequestAdjustment &&
    !permissions.canApproveAdjustment &&
    !permissions.canRejectAdjustment
  )
    notFound();
  if (isLoading || !request) return <PageSkeleton />;

  const isPending = request.status === ADJUSTMENT_STATUS_PENDING;
  const marginDelta = request.margin_amount_after - request.margin_amount_before;

  return (
    <div className="space-y-6">
      <HeaderTableWrapper>
        <TitleComponent
          title={`Ajuste de Margen — ${request.quote_correlative}`}
          subtitle={`Solicitado por ${request.requested_by_name} el ${new Date(request.created_at).toLocaleDateString("es-PE")}`}
          icon={PURCHASE_REQUEST_QUOTE_ADJUSTMENT.ICON}
        />
        <Badge color={ADJUSTMENT_STATUS_COLOR[request.status] ?? "gray"}>
          {ADJUSTMENT_STATUS_LABEL[request.status] ?? request.status}
        </Badge>
      </HeaderTableWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Titular</p>
          <p className="font-semibold">{request.holder_name}</p>
        </div>
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Motivo</p>
          <p className="font-medium">{request.reason || "—"}</p>
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-2">
        <p className="text-sm font-semibold">Impacto en el Margen</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Antes</p>
            <p className="text-lg font-semibold">
              S/ <NumberFormat value={request.margin_amount_before.toFixed(2)} />{" "}
              ({request.margin_pct_before.toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Después</p>
            <p className="text-lg font-semibold">
              S/ <NumberFormat value={request.margin_amount_after.toFixed(2)} />{" "}
              ({request.margin_pct_after.toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variación</p>
            <p
              className={`text-lg font-semibold ${marginDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {marginDelta >= 0 ? "+" : ""}
              <NumberFormat value={marginDelta.toFixed(2)} />
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="text-left px-4 py-2">Cambio</th>
              <th className="text-left px-4 py-2">Concepto</th>
              <th className="text-right px-4 py-2">Antes</th>
              <th className="text-right px-4 py-2">Después</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {request.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  {ADJUSTMENT_ACTION_LABEL[item.action] ?? item.action}
                </td>
                <td className="px-4 py-2">{item.concept_code ?? "—"}</td>
                <td className="px-4 py-2 text-right">
                  {item.previous_precio_unitario != null
                    ? `S/ ${Number(item.previous_precio_unitario).toFixed(2)}`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  {item.new_precio_unitario != null
                    ? `S/ ${Number(item.new_precio_unitario).toFixed(2)}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {request.status === "rejected" && request.rejection_reason && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Motivo del rechazo</p>
          <p className="text-sm text-red-700">{request.rejection_reason}</p>
        </div>
      )}

      {isPending &&
        (permissions.canApproveAdjustment || permissions.canRejectAdjustment) && (
          <div className="flex justify-end gap-2">
            {permissions.canRejectAdjustment && (
              <Button variant="destructive" onClick={() => setRejectOpen(true)}>
                Rechazar
              </Button>
            )}
            {permissions.canApproveAdjustment && (
              <Button onClick={() => setApproveOpen(true)}>Aprobar</Button>
            )}
          </div>
        )}

      {approveOpen && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Aprobar ajuste de margen?"
          description="Se aplicarán los cambios de bono/descuento solicitados y se actualizará el margen real de la cotización."
          confirmText="Sí, aprobar"
          cancelText="Cancelar"
          onConfirm={handleApprove}
          variant="default"
          icon="info"
          open={true}
          onOpenChange={(open) => !open && setApproveOpen(false)}
        />
      )}

      {rejectOpen && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Rechazar ajuste de margen?"
          description="No se aplicará ningún cambio. El solicitante será notificado por correo."
          confirmText="Sí, rechazar"
          cancelText="Cancelar"
          onConfirm={handleReject}
          variant="destructive"
          icon="warning"
          open={true}
          onOpenChange={(open) => !open && setRejectOpen(false)}
        >
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo (opcional)"
            rows={3}
          />
        </ConfirmationDialog>
      )}
    </div>
  );
}
