import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { exportPurchaseRequestQuoteFile } from "../lib/purchaseRequestQuote.actions";

interface PurchaseRequestQuoteActionsProps {
  dateFrom?: Date;
  dateTo?: Date;
  sedeId?: string;
  selectedModelId?: string;
  selectedBrandId?: string;
  permissions: {
    canExport: boolean;
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

  if (!permissions.canExport) return null;

  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() =>
          exportPurchaseRequestQuoteFile({ params: getParams() })
        }
        onPdfDownload={() =>
          exportPurchaseRequestQuoteFile({ params: getParams("pdf") })
        }
      />
    </ActionsWrapper>
  );
}
