"use client";

import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface VehicleAssignmentProps {
  onCreate: () => void;
}

export default function VehicleAssignmentActions({
  onCreate,
}: VehicleAssignmentProps) {
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={onCreate}
      >
        <Plus className="size-4 mr-2" /> Agregar Asignacion
      </Button>
    </ActionsWrapper>
  );
}
