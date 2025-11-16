"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function ObjectiveActions() {
  const push = useNavigate();

  const handleAddObjective = () => {
    push("./objetivos/agregar");
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
