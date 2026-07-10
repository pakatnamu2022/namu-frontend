import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { CAMPAIGN } from "../lib/campaign.constants";

interface CampaignActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function CampaignActions({ permissions }: CampaignActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = CAMPAIGN;

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
        <Plus className="size-4 mr-2" /> Agregar Campaña
      </Button>
    </ActionsWrapper>
  );
}
