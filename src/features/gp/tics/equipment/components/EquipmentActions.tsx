"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function EquipmentActions() {
  const push = useNavigate();

  const handleAddEquipment = () => {
    push("./equipos/actualizar");
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddEquipment}
      >
        <Plus className="size-4 mr-2" /> Agregar equipo
      </Button>
    </ActionsWrapper>
  );
}
