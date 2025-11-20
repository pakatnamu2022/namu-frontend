"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface PermissionsActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function PermissionsActions({
  onSave,
  isSaving = false,
}: PermissionsActionsProps) {
  return (
    <Button onClick={onSave} disabled={isSaving} size="lg">
      <Save className="size-4 mr-2" />
      {isSaving ? "Guardando..." : "Guardar Permisos"}
    </Button>
  );
}
