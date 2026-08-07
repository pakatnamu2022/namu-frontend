import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { useNavigate } from "react-router-dom";
import { ORDER_QUOTATION_MESON } from "../../../taller/cotizacion/lib/proforma.constants";
import { exportOrderQuotations } from "../lib/quotationMeson.actions";

interface OrderQuotationMesonActionsProps {
  permissions: {
    canCreate: boolean;
  };
  filters?: Record<string, any>;
}

export default function OrderQuotationMesonActions({
  permissions,
  filters,
}: OrderQuotationMesonActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ORDER_QUOTATION_MESON;

  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() => exportOrderQuotations({ params: filters })}
      />
      {permissions.canCreate && (
        <Button size="sm" variant="outline" onClick={() => router(ROUTE_ADD)}>
          <Plus className="size-4 mr-2" /> Agregar Cotización
        </Button>
      )}
    </ActionsWrapper>
  );
}
