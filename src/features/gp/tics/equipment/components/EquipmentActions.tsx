"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EQUIPMENT } from "../lib/equipment.constants";

export default function EquipmentActions() {
  const push = useNavigate();
  const { ROUTE_ADD } = EQUIPMENT;

  const handleAddEquipment = () => {
    push(ROUTE_ADD);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        className="ml-auto"
        onClick={handleAddEquipment}
      >
        <Plus className="size-4 mr-2" /> Agregar equipo
      </Button>
    </ActionsWrapper>
  );
}
