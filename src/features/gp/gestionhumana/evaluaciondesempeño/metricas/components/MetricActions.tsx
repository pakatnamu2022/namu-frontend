"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { METRIC } from "../lib/metric.constant";

export default function MetricActions() {
  const { ROUTE_ADD } = METRIC;
  const push = useNavigate();

  const handleAddMetric = () => {
    push(ROUTE_ADD);
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
