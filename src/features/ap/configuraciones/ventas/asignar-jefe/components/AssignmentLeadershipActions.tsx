import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ASSIGNMENT_LEADERSHIP } from "../lib/assignmentLeadership.constants";
import { Plus, Copy } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { api } from "@/core/api";
import { currentYear, currentMonth, errorToast, successToast } from "@/core/core.function";
import { MONTH_OPTIONS } from "@/core/core.constants";

interface AssignmentLeadershipActionsProps {
  permissions: {
    canCreate: boolean;
  };
  onSnapshotSuccess?: () => void;
}

const SNAPSHOT_LABELS = [
  'Asignación de Sedes',
  'Asignación de Marcas',
  'Asignación de Jefes',
  'Gerentes Comerciales',
];

export default function AssignmentLeadershipActions({
  permissions,
  onSnapshotSuccess,
}: AssignmentLeadershipActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ASSIGNMENT_LEADERSHIP;
  const [isLoading, setIsLoading] = useState(false);

  const monthName = MONTH_OPTIONS[currentMonth() - 1]?.label ?? "";

  const handleSnapshot = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/ap/configuration/periodSnapshot');
      successToast(data.message);
      onSnapshotSuccess?.();
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? 'Error al iniciar el período';
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ConfirmationDialog
        trigger={
          <Button size="sm" variant="outline" className="gap-2">
            <Copy className="size-4" />
            Iniciar período
          </Button>
        }
        title={`Iniciar período ${currentYear()} — ${monthName}`}
        description="Esto copiará toda la configuración del mes anterior al período actual. Si ya existen registros para este mes no serán sobreescritos."
        confirmText={isLoading ? 'Copiando...' : 'Confirmar'}
        cancelText="Cancelar"
        confirmDisabled={isLoading}
        icon="info"
        onConfirm={handleSnapshot}
      >
        <ul className="text-sm text-muted-foreground space-y-1">
          {SNAPSHOT_LABELS.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <Copy className="size-3 shrink-0" />
              {label}
            </li>
          ))}
        </ul>
      </ConfirmationDialog>

      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router(ROUTE_ADD!)}
        >
          <Plus className="size-4 mr-2" />
          Agregar Asignación
        </Button>
      )}
    </div>
  );
}
