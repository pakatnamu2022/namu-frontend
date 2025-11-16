"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useState } from "react";
import PersonSegmentModal from "./PersonSegmentModal";

interface PersonSegmentActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function PersonSegmentActions({
  permissions,
}: PersonSegmentActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Segmento Persona
      </Button>
      <PersonSegmentModal
        title="Crear Segmento Persona"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
