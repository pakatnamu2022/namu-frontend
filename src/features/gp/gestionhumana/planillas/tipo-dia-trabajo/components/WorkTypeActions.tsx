"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WORK_TYPE } from "../lib/work-type.constant";

const { MODEL, ROUTE_ADD } = WORK_TYPE;

export default function WorkTypeActions() {
  const push = useNavigate();

  const handleAdd = () => {
    push(ROUTE_ADD);
  };

  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        size="sm"
        variant="outline"
        className="md:ml-auto w-full md:w-auto"
        onClick={handleAdd}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
