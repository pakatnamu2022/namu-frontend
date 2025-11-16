"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import WorkersModal from "./WorkersModal";

export default function HierarchicalCategoryActions() {
  const { push } = useRouter();
  const [workersModalOpen, setWorkersModalOpen] = useState(false);

  const handleAddHierarchicalCategory = () => {
    push("./categorias-jerarquicas/agregar");
  };

  const handleOpenWorkersModal = () => {
    setWorkersModalOpen(true);
  };

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={handleOpenWorkersModal}>
        <Users className="size-4 mr-2" /> Ver Trabajadores Faltantes
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddHierarchicalCategory}
      >
        <Plus className="size-4 mr-2" /> Agregar Categoría Jerárquica
      </Button>

      <WorkersModal
        open={workersModalOpen}
        onOpenChange={setWorkersModalOpen}
      />
    </ActionsWrapper>
  );
}
