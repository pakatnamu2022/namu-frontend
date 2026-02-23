"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Users, Scale } from "lucide-react";
import CycleWeightsPreviewSheet from "./CycleWeightsPreviewSheet";
import CycleEligibleWorkersSheet from "./CycleEligibleWorkersSheet";

interface Props {
  id: number;
  hasDetails: boolean;
  onAssign: (id: number) => void;
}

export default function CyclePersonDetailActions({
  id,
  hasDetails,
  onAssign,
}: Props) {
  const [openWeightsPreview, setOpenWeightsPreview] = useState(false);
  const [openEligibleWorkers, setOpenEligibleWorkers] = useState(false);

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

        {/* Assign eligible workers — only when details already exist */}
        {hasDetails && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenEligibleWorkers(true)}
          >
            <Users className="size-5" />
            Asignar Trabajadores
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
      </ActionsWrapper>

      <CycleWeightsPreviewSheet
        open={openWeightsPreview}
        onClose={() => setOpenWeightsPreview(false)}
        cycleId={id}
      />

      <CycleEligibleWorkersSheet
        open={openEligibleWorkers}
        onClose={() => setOpenEligibleWorkers(false)}
        cycleId={id}
      />
    </>
  );
}
