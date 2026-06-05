import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { ASSIGN_SALES_SERIES } from "../lib/assignSalesSeries.constants";

interface AssignSalesSeriesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AssignSalesSeriesActions({
  permissions,
}: AssignSalesSeriesActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ASSIGN_SALES_SERIES;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Asignar Serie de Venta
      </Button>
    </ActionsWrapper>
  );
}
