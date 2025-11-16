"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ExcludedModal from "./ExcludedModal";
import { EXCLUDED } from "../lib/excluded.constants";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

const { MODEL } = EXCLUDED;

export default function ExcludedActions() {
  const [open, setOpen] = useState(false);

  const handleAddExcluded = () => {
    setOpen(true);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddExcluded}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <ExcludedModal
        title={`Crear ${MODEL.name}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
