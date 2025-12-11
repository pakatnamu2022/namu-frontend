import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ORDER_QUOTATION } from "../lib/proforma.constants";

interface OrderQuotationActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function OrderQuotationActions({
  permissions,
}: OrderQuotationActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ORDER_QUOTATION;

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
