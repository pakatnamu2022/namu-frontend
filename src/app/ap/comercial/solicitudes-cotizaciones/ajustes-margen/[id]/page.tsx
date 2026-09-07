"use client";

import { useParams } from "react-router-dom";
import { useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { ListChecks, User, MessageSquare, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.constants";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import { usePurchaseRequestQuoteById } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.hook";
import QuoteMarginSummary from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/components/QuoteMarginSummary";
import AdjustmentMarginPreview from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/components/AdjustmentMarginPreview";
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
  const { MODEL, ABSOLUTE_ROUTE } = PURCHASE_REQUEST_QUOTE_ADJUSTMENT;
  // Es una subruta de Solicitudes de Compra: reutiliza el mismo módulo/permisos
  // (no requiere una Vista nueva en el menú).
  const permissions = useModulePermissions(PURCHASE_REQUEST_QUOTE.ROUTE);

  const { data: request, isLoading, refetch } = useAdjustmentRequestById(
    Number(id),
  );
  const { data: quote } = usePurchaseRequestQuoteById(
    request?.purchase_request_quote_id ?? 0,
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
      successToast(
        "Ajuste aprobado: los bonos/descuentos/obsequios fueron actualizados.",
      );
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

  if (isLoadingModule) return <FormSkeleton />;
  if (!checkRouteExists(PURCHASE_REQUEST_QUOTE.ROUTE)) notFound();
  if (
    !permissions.canViewAdjustments &&
    !permissions.canRequestAdjustment &&
    !permissions.canApproveAdjustment &&
    !permissions.canRejectAdjustment
  )
    notFound();
  if (isLoading || !request) return <FormSkeleton />;

  const isPending = request.status === ADJUSTMENT_STATUS_PENDING;
  const marginProjection = {
    amountBefore: request.margin_amount_before,
    pctBefore: request.margin_pct_before,
    amountAfter: request.margin_amount_after,
    pctAfter: request.margin_pct_after,
    amountDelta: request.margin_amount_after - request.margin_amount_before,
    pctDelta: request.margin_pct_after - request.margin_pct_before,
  };

  const canResolve =
    isPending &&
    (permissions.canApproveAdjustment || permissions.canRejectAdjustment);

  const metaRow = (
    icon: typeof User,
    label: string,
    value: React.ReactNode,
  ) => {
    const Icon = icon;
    return (
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-sm font-medium break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <FormWrapper maxWidth="max-w-(--breakpoint-2xl)">
      <TitleFormComponent
        title={`Ajuste de Margen — ${request.quote_correlative}`}
        subtitle={`Solicitado por ${request.requested_by_name} el ${new Date(request.created_at).toLocaleDateString("es-PE")}`}
        icon={PURCHASE_REQUEST_QUOTE_ADJUSTMENT.ICON}
        backRoute={ABSOLUTE_ROUTE}
      >
        <Badge color={ADJUSTMENT_STATUS_COLOR[request.status] ?? "gray"}>
          {ADJUSTMENT_STATUS_LABEL[request.status] ?? request.status}
        </Badge>
      </TitleFormComponent>

      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl bg-card shadow-md p-5 space-y-4 lg:col-span-1">
            {metaRow(User, "Titular", request.holder_name || "—")}
            {metaRow(
              User,
              "Solicitado por",
              `${request.requested_by_name ?? "—"} · ${new Date(request.created_at).toLocaleDateString("es-PE")}`,
            )}
            {metaRow(MessageSquare, "Motivo", request.reason || "—")}
            {!isPending &&
              request.resolved_by_name &&
              metaRow(
                CheckCircle2,
                `${ADJUSTMENT_STATUS_LABEL[request.status] ?? request.status} por`,
                `${request.resolved_by_name}${
                  request.resolved_at
                    ? ` · ${new Date(request.resolved_at).toLocaleDateString("es-PE")}`
                    : ""
                }`,
              )}
          </div>

          <div className="lg:col-span-2">
            <AdjustmentMarginPreview
              projection={marginProjection}
              currencySymbol={request.currency_symbol}
              changeCount={request.items.length}
              subtitle={
                isPending
                  ? "Proyección · pendiente de aprobación"
                  : "Impacto aplicado tras la aprobación"
              }
            />
          </div>
        </div>

        <div className="rounded-2xl bg-card shadow-md overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ListChecks className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Cambios solicitados
                </p>
                <p className="text-xs text-muted-foreground leading-tight">
                  {request.items.length}{" "}
                  {request.items.length === 1 ? "línea" : "líneas"}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-medium">Cambio</th>
                    <th className="text-left px-4 py-2.5 font-medium">
                      Concepto
                    </th>
                    <th className="text-right px-4 py-2.5 font-medium">Antes</th>
                    <th className="text-right px-5 py-2.5 font-medium">
                      Después
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {request.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-2.5">
                        {ADJUSTMENT_ACTION_LABEL[item.action] ?? item.action}
                      </td>
                      <td className="px-4 py-2.5">
                        {item.item_type === "gift"
                          ? `Obsequio: ${item.accessory_label ?? "Accesorio"}${
                              item.quantity ? ` (x${item.quantity})` : ""
                            }`
                          : (item.concept_code ?? "—")}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {item.previous_precio_unitario != null
                          ? `${request.currency_symbol} ${Number(item.previous_precio_unitario).toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums">
                        {item.new_precio_unitario != null
                          ? `${request.currency_symbol} ${Number(item.new_precio_unitario).toFixed(2)}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        {quote && <QuoteMarginSummary quote={quote} layout="grid" />}

        {request.status === "rejected" && request.rejection_reason && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/10 shadow-md p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Motivo del rechazo
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              {request.rejection_reason}
            </p>
          </div>
        )}

        {canResolve && (
          <div className="flex items-center justify-end gap-2 rounded-2xl bg-card shadow-md p-4 sm:sticky sm:bottom-4">
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
      </div>

      {approveOpen && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Aprobar ajuste de margen?"
          description="Se aplicarán los cambios de bono/descuento/obsequio solicitados y se actualizará el margen real de la cotización."
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
    </FormWrapper>
  );
}
