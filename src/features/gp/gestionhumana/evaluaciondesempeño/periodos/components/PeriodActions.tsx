"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PeriodActions() {
  const { push } = useRouter();

  const handleAddPeriod = () => {
    push("./periodos/agregar");
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
