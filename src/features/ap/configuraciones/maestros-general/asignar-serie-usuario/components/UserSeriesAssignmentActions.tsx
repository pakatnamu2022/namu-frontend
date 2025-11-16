import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { USER_SERIES_ASSIGNMENT } from "../lib/userSeriesAssignment.constants";

interface UserSeriesAssignmentActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function UserSeriesAssignmentActions({
  permissions,
}: UserSeriesAssignmentActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = USER_SERIES_ASSIGNMENT;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Asignación de Serie
      </Button>
    </ActionsWrapper>
  );
}
