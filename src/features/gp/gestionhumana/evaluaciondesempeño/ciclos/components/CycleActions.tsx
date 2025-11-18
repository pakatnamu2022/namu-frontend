"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CYCLE } from "../lib/cycle.constants";

export default function CycleActions() {
  const { ROUTE_ADD } = CYCLE;
  const push = useNavigate();

  const handleAddCycle = () => {
    push(ROUTE_ADD);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddCycle}
      >
        <Plus className="size-4 mr-2" /> Agregar ciclo
      </Button>
    </ActionsWrapper>
  );
}
