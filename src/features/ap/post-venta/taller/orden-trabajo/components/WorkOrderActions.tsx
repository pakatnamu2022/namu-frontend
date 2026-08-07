import { Button } from "@/components/ui/button";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { Plus, StickyNote } from "lucide-react";
import { exportWorkOrder } from "../lib/workOrder.actions";
import { INTERNAL_NOTE_MIGRATION } from "@/features/ap/post-venta/taller/notas-internas/lib/internalNoteMigration.constants";

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
      <Button
      
        size="sm"
        variant="outline"
        onClick={() => router(INTERNAL_NOTE_MIGRATION.ABSOLUTE_ROUTE)}
      >
        <StickyNote className="size-4 mr-2" /> Migraciones de NI
      </Button>
      {permissions.canCreate && (
        <Button size="sm" variant="outline" onClick={() => router(ROUTE_ADD)}>
          <Plus className="size-4 mr-2" /> Agregar Orden de Trabajo
        </Button>
      )}
    </ActionsWrapper>
  );
}
