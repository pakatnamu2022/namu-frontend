"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useState } from "react";
import MaritalStatusModal from "./MaritalStatusModal";

interface MaritalStatusActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function MaritalStatusActions({
  permissions,
}: MaritalStatusActionsProps) {
  const [open, setOpen] = useState(false);

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Estado Civil
      </Button>
      <MaritalStatusModal
        title="Crear Estado Civil"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
