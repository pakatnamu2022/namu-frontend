"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ExclusionModal from "./ExclusionModal";
import { PAYROLL_EXCLUSION } from "../lib/exclusion.constants";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

const { MODEL } = PAYROLL_EXCLUSION;

export default function ExclusionActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <ExclusionModal
        title={`Crear ${MODEL.name}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
