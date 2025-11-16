"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MetricActions() {
  const { push } = useRouter();

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
