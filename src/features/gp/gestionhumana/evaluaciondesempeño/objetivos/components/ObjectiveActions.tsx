"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ExportButtons from "@/shared/components/ExportButtons";
import { Plus } from "lucide-react";
import { exportAssignedObjectives } from "@/features/gp/gestionhumana/evaluaciondesempeño/objetivos/lib/objective.actions";

interface ObjectiveActionsProps {
  onAdd: () => void;
}

export default function ObjectiveActions({ onAdd }: ObjectiveActionsProps) {
  return (
    <ActionsWrapper>
      <ExportButtons
        onExcelDownload={() => exportAssignedObjectives("excel")}
        onPdfDownload={() => exportAssignedObjectives("pdf")}
      />
      <Button
        size="sm"
        variant="outline"
        onClick={onAdd}
      >
        <Plus className="size-4 mr-2" /> Agregar objetivo
      </Button>
    </ActionsWrapper>
  );
}
