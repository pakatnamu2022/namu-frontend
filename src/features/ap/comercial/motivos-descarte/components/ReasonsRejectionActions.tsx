"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import ReasonsRejectionModal from "./ReasonsRejectionModal";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ReasonsRejectionActions({ permissions }: Props) {
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
        <Plus className="size-4 mr-2" /> Agregar Motivo de Descarte
      </Button>
      <ReasonsRejectionModal
        title="Crear Motivo de Descarte"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
