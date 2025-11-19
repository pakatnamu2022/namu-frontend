"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OBJECTIVE } from "../lib/objective.constants";

export default function ObjectiveActions() {
  const push = useNavigate();
  const { ROUTE_ADD } = OBJECTIVE;

  const handleAddObjective = () => {
    push(ROUTE_ADD);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddObjective}
      >
        <Plus className="size-4 mr-2" /> Agregar objetivo
      </Button>
    </ActionsWrapper>
  );
}
