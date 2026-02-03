"use client";

import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface GoalTravelActionsProps {
  onCreate: () => void;
}

export default function GoalTravelActions({
  onCreate,
}: GoalTravelActionsProps) {
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={onCreate}
      >
        <Plus className="size-4 mr-2" /> Agregar Meta
      </Button>
    </ActionsWrapper>
  );
}
