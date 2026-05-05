"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { PARAMETER } from "../lib/parameter.constans";

const { MODEL, ROUTE_ADD } = PARAMETER;

export default function ParameterActions() {
  const push = useNavigate();

  const handleAddCompetence = () => {
    push(ROUTE_ADD);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        size="sm"
        variant="outline"
        className="md:ml-auto w-full md:w-auto"
        onClick={handleAddCompetence}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
