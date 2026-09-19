"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface Props {
  onAdd: () => void;
  label?: string;
  permissions: {
    canCreate: boolean;
  };
}

export default function SuppliersActions({
  onAdd,
  label = "Agregar Proveedor",
  permissions,
}: Props) {
  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={onAdd}>
        <Plus className="size-4 mr-2" /> {label}
      </Button>
    </ActionsWrapper>
  );
}
