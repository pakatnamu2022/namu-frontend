import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { APPOINTMENT_PLANNING } from "../lib/appointmentPlanning.constants";

interface AppointmentPlanningActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AppointmentPlanningActions({
  permissions,
}: AppointmentPlanningActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = APPOINTMENT_PLANNING;

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
        <Plus className="size-4 mr-2" /> Agregar Cita
      </Button>
    </ActionsWrapper>
  );
}
