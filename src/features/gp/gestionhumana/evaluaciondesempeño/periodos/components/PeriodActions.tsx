"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PERIOD } from "../lib/period.constans";

export default function PeriodActions() {
  const push = useNavigate();
  const { ROUTE_ADD } = PERIOD;

  const handleAddPeriod = () => {
    push(ROUTE_ADD);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddPeriod}
      >
        <Plus className="size-4 mr-2" /> Agregar periodo
      </Button>
    </ActionsWrapper>
  );
}
