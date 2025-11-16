import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { APPROVED_ACCESSORIES } from "../lib/approvedAccessories.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ApprovedAccesoriesActions({ permissions }: Props) {
  const router = useRouter();
  const { ROUTE_ADD } = APPROVED_ACCESSORIES;

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
        <Plus className="size-4 mr-2" /> Agregar Accesorio
      </Button>
    </ActionsWrapper>
  );
}
