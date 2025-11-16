"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface PermissionsActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export function PermissionsActions({
  onCancel,
  onSave,
  isSaving = false,
}: PermissionsActionsProps) {
  return (
    <div className="flex justify-end items-center gap-3 pt-4">
      <Button variant="outline" onClick={onCancel} disabled={isSaving}>
        Regresar
      </Button>
      <Button onClick={onSave} disabled={isSaving} size="lg">
        <Save className="size-4 mr-2" />
        {isSaving ? "Guardando..." : "Guardar Permisos"}
      </Button>
    </div>
  );
}
