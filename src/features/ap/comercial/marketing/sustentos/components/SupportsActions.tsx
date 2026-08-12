import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { SUPPORTS } from "../lib/supports.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function SupportsActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = SUPPORTS;

  if (!permissions.canCreate) return null;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" className="ml-auto" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar Sustento
      </Button>
    </ActionsWrapper>
  );
}
