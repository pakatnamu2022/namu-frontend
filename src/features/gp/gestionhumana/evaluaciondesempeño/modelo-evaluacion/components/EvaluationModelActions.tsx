"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EVALUATION_MODEL } from "../lib/evaluationModel.constants";

export default function EvaluationModelActions() {
  const { ROUTE_ADD } = EVALUATION_MODEL;
  const push = useNavigate();

  const handleAdd = () => {
    push(ROUTE_ADD!);
  };

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={handleAdd}>
        <Plus className="size-4 mr-2" /> Agregar Modelo de Evaluación
      </Button>
    </ActionsWrapper>
  );
}
