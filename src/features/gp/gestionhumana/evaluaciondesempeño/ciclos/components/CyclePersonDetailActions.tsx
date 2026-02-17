"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Users, Scale } from "lucide-react";
import CycleWeightsPreviewSheet from "./CycleWeightsPreviewSheet";

interface Props {
  id: number;
  onAssign: (id: number) => void;
}

export default function CyclePersonDetailActions({ id, onAssign }: Props) {
  const [openWeightsPreview, setOpenWeightsPreview] = useState(false);

  return (
    <>
      <ActionsWrapper>
        {/* Asign */}
        <Button variant="outline" size="sm" onClick={() => onAssign(id)}>
          <Users className="size-5" />
          Asignar
        </Button>

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
    </>
  );
}
