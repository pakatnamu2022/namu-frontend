"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CATEGORY_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";
import HierarchicalCategoryObjectiveModal from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/components/HierarchicalCategoryObjectiveModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

export default function HierarchicalCategoryObjectiveActions({
  id,
}: {
  id: number;
}) {
  const { MODEL } = CATEGORY_OBJECTIVE;
  const [open, setOpen] = useState(false);

  const handleAddHierarchicalCategoryObjective = () => {
    setOpen(true);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddHierarchicalCategoryObjective}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <HierarchicalCategoryObjectiveModal
        id={id}
        title={`Crear ${MODEL.name}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
