"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkersModal from "./WorkersModal";
import { HIERARCHICAL_CATEGORY } from "../lib/hierarchicalCategory.constants";

export default function HierarchicalCategoryActions() {
  const { ROUTE_ADD } = HIERARCHICAL_CATEGORY;
  const push = useNavigate();
  const [workersModalOpen, setWorkersModalOpen] = useState(false);

  const handleAddHierarchicalCategory = () => {
    push(ROUTE_ADD!);
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
