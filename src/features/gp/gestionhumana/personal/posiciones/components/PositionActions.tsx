"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { POSITION } from "../lib/position.constant";

const { ROUTE_ADD, MODEL } = POSITION;

export default function PositionActions() {
  const { push } = useRouter();

  const handleAddWorker = () => {
    push(`./${ROUTE_ADD}`);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddWorker}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
