"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";

interface ObjectiveActionsProps {
  onAdd: () => void;
}

export default function ObjectiveActions({ onAdd }: ObjectiveActionsProps) {
  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={onAdd}
      >
        <Plus className="size-4 mr-2" /> Agregar objetivo
      </Button>
    </ActionsWrapper>
  );
}
