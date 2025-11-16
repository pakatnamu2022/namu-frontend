"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function CycleActions() {
  const push = useNavigate();

  const handleAddCycle = () => {
    push("./ciclos/agregar");
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
