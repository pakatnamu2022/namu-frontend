"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TelephoneAccountActionsProps {
  onAdd: () => void;
}

export default function TelephoneAccountActions({
  onAdd,
}: TelephoneAccountActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar cuenta
      </Button>
    </div>
  );
}
