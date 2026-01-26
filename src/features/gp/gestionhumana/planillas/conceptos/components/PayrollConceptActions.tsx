"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PAYROLL_CONCEPT } from "../lib/payroll-concept.constant";

const { MODEL, ROUTE_ADD } = PAYROLL_CONCEPT;

export default function PayrollConceptActions() {
  const push = useNavigate();

  const handleAddConcept = () => {
    push(ROUTE_ADD);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        size="sm"
        variant="outline"
        className="md:ml-auto w-full md:w-auto"
        onClick={handleAddConcept}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
