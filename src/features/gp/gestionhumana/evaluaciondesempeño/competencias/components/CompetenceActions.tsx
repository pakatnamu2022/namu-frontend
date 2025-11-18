"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COMPETENCE } from "../lib/competence.constans";

const { MODEL, ROUTE_ADD } = COMPETENCE;

export default function CompetenceActions() {
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
