import { Button } from "@/components/ui/button";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { Plus } from "lucide-react";
import { exportWorkOrder } from "../lib/workOrder.actions";

interface WorkOrderActionsProps {
  permissions: {
    canCreate: boolean;
  };
  filters?: Record<string, any>;
}

export default function WorkOrderActions({
  permissions,
  filters,
}: WorkOrderActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = WORKER_ORDER;

  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() => exportWorkOrder({ params: filters })}
      />
      {permissions.canCreate && (
        <Button size="sm" variant="outline" onClick={() => router(ROUTE_ADD)}>
          <Plus className="size-4 mr-2" /> Agregar Orden de Trabajo
        </Button>
      )}
    </ActionsWrapper>
  );
}
