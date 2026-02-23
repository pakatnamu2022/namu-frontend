"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TelephonePlanActionsProps {
  onAdd: () => void;
}

export default function TelephonePlanActions({
  onAdd,
}: TelephonePlanActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar plan
      </Button>
    </div>
  );
}
