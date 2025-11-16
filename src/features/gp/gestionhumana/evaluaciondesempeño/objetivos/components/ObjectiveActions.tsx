"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ObjectiveActions() {
  const { push } = useRouter();

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
