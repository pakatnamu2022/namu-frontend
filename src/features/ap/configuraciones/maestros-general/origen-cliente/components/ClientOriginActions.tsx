"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useState } from "react";
import ClientOriginModal from "./ClientOriginModal";

interface ClientOriginActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ClientOriginActions({
  permissions,
}: ClientOriginActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Origen
      </Button>
      <ClientOriginModal
        title="Crear Origen"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
