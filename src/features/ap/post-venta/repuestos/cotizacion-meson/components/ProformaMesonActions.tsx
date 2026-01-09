import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ORDER_QUOTATION_MESON } from "../../../taller/cotizacion/lib/proforma.constants";

interface OrderQuotationMesonActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function OrderQuotationMesonActions({
  permissions,
}: OrderQuotationMesonActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ORDER_QUOTATION_MESON;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar Cotización
      </Button>
    </ActionsWrapper>
  );
}
