"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Users, Scale, Trash2 } from "lucide-react";
import CycleWeightsPreviewSheet from "./CycleWeightsPreviewSheet";
import RemoveObjectivePreviewSheet from "./RemoveObjectivePreviewSheet";

interface Props {
  id: number;
  hasDetails: boolean;
  onAssign: (id: number) => void;
  objectiveId?: string | null;
  onObjectiveRemoved?: () => void;
}

export default function CyclePersonDetailActions({
  id,
  hasDetails,
  onAssign,
  objectiveId,
  onObjectiveRemoved,
}: Props) {
  const [openWeightsPreview, setOpenWeightsPreview] = useState(false);
  const [openRemoveObjective, setOpenRemoveObjective] = useState(false);

  return (
    <>
      <ActionsWrapper>
        {/* Assign — only when there are no details yet */}
        {!hasDetails && (
          <Button variant="outline" size="sm" onClick={() => onAssign(id)}>
            <Users className="size-5" />
            Asignar
          </Button>
        )}

        {/* Weights Preview */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenWeightsPreview(true)}
        >
          <Scale className="size-5" />
          Vista Previa de Pesos
        </Button>

        {/* Remove Objective from Cycle — only when an objective is selected */}
        {objectiveId && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenRemoveObjective(true)}
          >
            <Trash2 className="size-5" />
            Eliminar Objetivo del Ciclo
          </Button>
        )}
      </ActionsWrapper>

      <CycleWeightsPreviewSheet
        open={openWeightsPreview}
        onClose={() => setOpenWeightsPreview(false)}
        cycleId={id}
      />

      <RemoveObjectivePreviewSheet
        open={openRemoveObjective}
        onClose={() => setOpenRemoveObjective(false)}
        cycleId={id}
        objectiveId={objectiveId ? Number(objectiveId) : null}
        onRemoved={onObjectiveRemoved}
      />
    </>
  );
}
