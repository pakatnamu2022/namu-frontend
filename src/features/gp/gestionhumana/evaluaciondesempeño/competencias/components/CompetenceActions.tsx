"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { COMPETENCE } from "../lib/competence.constans";

const { MODEL } = COMPETENCE;

export default function CompetenceActions() {
  const { push } = useRouter();

  const handleAddCompetence = () => {
    push("./competencias/agregar");
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
