import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import { APPROVED_ACCESSORIES } from "../lib/approvedAccessories.constants.ts";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ApprovedAccesoriesActions({ permissions }: Props) {
  const router = useNavigate();
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
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Accesorio
      </Button>
    </ActionsWrapper>
  );
}
