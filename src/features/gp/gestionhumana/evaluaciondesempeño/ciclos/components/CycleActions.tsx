"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CycleActions() {
  const { push } = useRouter();

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
