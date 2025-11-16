import { Button } from "@/components/ui/button";
import { ClipboardMinus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ASSIGN_COMPANY_BRANCH } from "../lib/assignCompanyBranch.constants";

interface AssignSedeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AssignSedeActions({
  permissions,
}: AssignSedeActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ASSIGN_COMPANY_BRANCH;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <ClipboardMinus className="size-4 mr-2" /> Agregar Asignación
      </Button>
    </div>
  );
}
