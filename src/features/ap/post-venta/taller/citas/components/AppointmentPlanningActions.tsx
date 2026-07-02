import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { useNavigate } from "react-router-dom";
import { APPOINTMENT_PLANNING } from "../lib/appointmentPlanning.constants";
import { exportAppointmentPlanning } from "../lib/appointmentPlanning.actions";

interface AppointmentPlanningActionsProps {
  permissions: {
    canCreate: boolean;
  };
  filters?: Record<string, any>;
}

export default function AppointmentPlanningActions({
  permissions,
  filters,
}: AppointmentPlanningActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = APPOINTMENT_PLANNING;

  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() => exportAppointmentPlanning({ params: filters })}
      />
      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => router(ROUTE_ADD)}
        >
          <Plus className="size-4 mr-2" /> Agregar Cita
        </Button>
      )}
    </ActionsWrapper>
  );
}
