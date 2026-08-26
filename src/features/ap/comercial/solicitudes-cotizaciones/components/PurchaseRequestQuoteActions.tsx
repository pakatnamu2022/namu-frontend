import { useNavigate } from "react-router-dom";
import { PercentCircle } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { Button } from "@/components/ui/button";
import { exportPurchaseRequestQuoteFile } from "../lib/purchaseRequestQuote.actions";
import { PURCHASE_REQUEST_QUOTE_ADJUSTMENT } from "../ajustes-margen/lib/purchaseRequestQuoteAdjustment.constants";

interface PurchaseRequestQuoteActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  sedeId?: string;
  selectedModelId?: string;
  selectedBrandId?: string;
  permissions: {
    canExport: boolean;
    canViewAdjustments?: boolean;
    canApproveAdjustment?: boolean;
    canRejectAdjustment?: boolean;
  };
}

export default function PurchaseRequestQuoteActions({
  dateFrom,
  dateTo,
  sedeId,
  selectedModelId,
  selectedBrandId,
  permissions,
}: PurchaseRequestQuoteActionsProps) {
  const navigate = useNavigate();
  const formatDate = (date: Date | undefined) =>
    date ? date.toLocaleDateString("en-CA") : undefined;

  const getParams = (format?: string) => ({
    ...(dateFrom && dateTo
      ? { created_at: [formatDate(dateFrom), formatDate(dateTo)] }
      : {}),
    ...(sedeId ? { sede_id: sedeId } : {}),
    ...(selectedModelId ? { ap_models_vn_id: selectedModelId } : {}),
    ...(selectedBrandId
      ? { "apModelsVn$family$brand_id": selectedBrandId }
      : {}),
    ...(format ? { format } : {}),
  });

  // Bandeja de aprobaciones: visible solo para quien puede ver/aprobar/rechazar
  // ajustes de margen (contable), independientemente de si puede exportar.
  const canSeeAdjustmentsInbox =
    permissions.canViewAdjustments ||
    permissions.canApproveAdjustment ||
    permissions.canRejectAdjustment;

  if (!permissions.canExport && !canSeeAdjustmentsInbox) return null;

  return (
    <ActionsWrapper>
      {canSeeAdjustmentsInbox && (
        <Button
          variant="outline"
          onClick={() =>
            navigate(PURCHASE_REQUEST_QUOTE_ADJUSTMENT.ABSOLUTE_ROUTE)
          }
        >
          <PercentCircle className="size-4" />
          Bandeja de Ajustes de Margen
        </Button>
      )}
      {permissions.canExport && (
        <ExportButtons
          onExcelDownload={() =>
            exportPurchaseRequestQuoteFile({ params: getParams() })
          }
          onPdfDownload={() =>
            exportPurchaseRequestQuoteFile({ params: getParams("pdf") })
          }
        />
      )}
    </ActionsWrapper>
  );
}
