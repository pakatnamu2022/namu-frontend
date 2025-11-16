import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

export default function AuditLogsActions() {
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => alert("Funcionalidad en desarrollo")}
      >
        <Plus className="size-4 mr-2" /> Reporte
      </Button>
    </ActionsWrapper>
  );
}
