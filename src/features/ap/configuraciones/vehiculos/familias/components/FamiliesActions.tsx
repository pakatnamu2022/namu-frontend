"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import FamiliesModal from "./FamiliesModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface FamiliesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function FamiliesActions({ permissions }: FamiliesActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Familia
      </Button>
      <FamiliesModal
        title="Crear Familia"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
