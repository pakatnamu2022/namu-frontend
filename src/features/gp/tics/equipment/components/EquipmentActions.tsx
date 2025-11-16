"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EquipmentActions() {
  const { push } = useRouter();

  const handleAddEquipment = () => {
    push("./equipos/agregar");
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddEquipment}
      >
        <Plus className="size-4 mr-2" /> Agregar equipo
      </Button>
    </ActionsWrapper>
  );
}
