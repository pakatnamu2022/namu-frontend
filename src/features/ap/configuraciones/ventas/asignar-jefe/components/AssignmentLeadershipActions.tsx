import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ASSIGNMENT_LEADERSHIP } from "../lib/assignmentLeadership.constants";
import { Plus } from "lucide-react";

interface AssignmentLeadershipProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AssignmentLeadershipActions({
  permissions,
}: AssignmentLeadershipProps) {
  const router = useRouter();
  const { ROUTE_ADD } = ASSIGNMENT_LEADERSHIP;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Asignación
      </Button>
    </div>
  );
}
