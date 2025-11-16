import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { DISTRICT } from "../lib/district.constants";

interface DistrictActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function DistrictActions({ permissions }: DistrictActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = DISTRICT;

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
        <Plus className="size-4 mr-2" /> Agregar Ubigeo
      </Button>
    </ActionsWrapper>
  );
}
