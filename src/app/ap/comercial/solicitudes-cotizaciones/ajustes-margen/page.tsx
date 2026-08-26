"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DataTable } from "@/shared/components/DataTable";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { SortingState } from "@tanstack/react-table";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.constants";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import {
  useAdjustmentRequests,
  useApproveAdjustmentRequest,
  useRejectAdjustmentRequest,
} from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/lib/purchaseRequestQuoteAdjustment.hook";
import { adjustmentRequestColumns } from "@/features/ap/comercial/solicitudes-cotizaciones/ajustes-margen/components/AdjustmentRequestColumns";

export default function AdjustmentRequestInboxPage() {
  const { checkRouteExists, isLoadingModule } = useCurrentModule();
  const navigate = useNavigate();
  const { MODEL, ABSOLUTE_ROUTE } = PURCHASE_REQUEST_QUOTE_ADJUSTMENT;
  // Es una subruta de Solicitudes de Compra: reutiliza el mismo módulo/permisos
  // (no requiere una Vista nueva en el menú).
  const permissions = useModulePermissions(PURCHASE_REQUEST_QUOTE.ROUTE);

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [approveId, setApproveId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, refetch } = useAdjustmentRequests({
    page,
    per_page,
    ...(sorting.length > 0 && {
      sort: sorting[0].id,
      direction: sorting[0].desc ? "desc" : "asc",
    }),
  });

  const approveMutation = useApproveAdjustmentRequest();
  const rejectMutation = useRejectAdjustmentRequest();

  const handleApprove = async () => {
    if (!approveId) return;
    try {
      await approveMutation.mutateAsync(approveId);
      await refetch();
      successToast("Ajuste aprobado: los bonos/descuentos fueron actualizados.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, msg));
    } finally {
      setApproveId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectId, reason: rejectReason });
      await refetch();
      successToast("Solicitud de ajuste rechazada.");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, msg));
    } finally {
      setRejectId(null);
      setRejectReason("");
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(PURCHASE_REQUEST_QUOTE.ROUTE)) notFound();
  if (
    !permissions.canViewAdjustments &&
    !permissions.canApproveAdjustment &&
    !permissions.canRejectAdjustment
  )
    notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Bandeja de Ajustes de Margen"
          subtitle="Solicitudes de ajuste de bono/descuento post-pago pendientes de revisión"
          icon={PURCHASE_REQUEST_QUOTE_ADJUSTMENT.ICON}
        />
      </HeaderTableWrapper>

      <DataTable
        columns={adjustmentRequestColumns({
          onViewDetail: (id) => navigate(`${ABSOLUTE_ROUTE}/${id}`),
          onApprove: setApproveId,
          onReject: setRejectId,
          permissions,
        })}
        data={data?.data || []}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      {approveId !== null && (
        <ConfirmationDialog
          trigger={<span className="hidden" />}
          title="¿Aprobar ajuste de margen?"
          description="Se aplicarán los cambios de bono/descuento solicitados y se actualizará el margen real de la cotización. Esta acción no se puede deshacer desde aquí."
          confirmText="Sí, aprobar"
          cancelText="Cancelar"
          onConfirm={handleApprove}
          variant="default"
          icon="info"
          open={true}
          onOpenChange={(open) => !open && setApproveId(null)}
        />
      )}

      {rejectId !== null && (
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
          onOpenChange={(open) => !open && setRejectId(null)}
        >
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo del rechazo (opcional)"
            rows={3}
          />
        </ConfirmationDialog>
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
