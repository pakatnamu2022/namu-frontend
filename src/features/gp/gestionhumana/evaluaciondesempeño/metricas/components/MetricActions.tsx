"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function MetricActions() {
  const push = useNavigate();

  const handleAddMetric = () => {
    push("./metricas/agregar");
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddMetric}
      >
        <Plus className="size-4 mr-2" /> Agregar Métrica
      </Button>
    </ActionsWrapper>
  );
}
