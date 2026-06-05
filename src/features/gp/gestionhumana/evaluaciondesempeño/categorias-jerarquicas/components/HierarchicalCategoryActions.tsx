"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { BarChart2, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorkersModal from "./WorkersModal";
import { HIERARCHICAL_CATEGORY } from "../lib/hierarchicalCategory.constants";
import { GlobalWeightReportSheet } from "./GlobalWeightReportSheet";

export default function HierarchicalCategoryActions() {
  const { ROUTE_ADD } = HIERARCHICAL_CATEGORY;
  const push = useNavigate();
  const [workersModalOpen, setWorkersModalOpen] = useState(false);
  const [weightReportOpen, setWeightReportOpen] = useState(false);

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
      <Button size="sm" variant="outline" onClick={() => setWeightReportOpen(true)}>
        <BarChart2 className="size-4 mr-2" /> Reporte de Pesos
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
      <GlobalWeightReportSheet
        open={weightReportOpen}
        onClose={() => setWeightReportOpen(false)}
      />
    </ActionsWrapper>
  );
}
