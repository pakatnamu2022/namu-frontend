"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { WORKER } from "../lib/worker.constant";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

const { MODEL, ROUTE_ADD } = WORKER;

export default function WorkerActions() {
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
        <Plus className="size-4 mr-2" /> {MODEL.name}
      </Button>
    </ActionsWrapper>
  );
}
