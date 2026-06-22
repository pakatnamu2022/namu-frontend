"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import ManualModal from "./ManualModal";

export default function ManualActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" /> Agregar Manual
      </Button>
      <ManualModal
        title="Crear Manual"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
