import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { KPIS } from "../lib/kpis.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function KpisActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = KPIS;

  if (!permissions.canCreate) return null;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" className="ml-auto" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar KPI
      </Button>
    </ActionsWrapper>
  );
}
