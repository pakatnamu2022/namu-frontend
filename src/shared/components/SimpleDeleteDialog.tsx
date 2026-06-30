"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Trash2, type LucideIcon } from "lucide-react";
import { ButtonAction } from "@/shared/components/ButtonAction";

interface SimpleDeleteDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description?: string;
}

export const DeleteButton = ({
  onClick,
  icon = Trash2,
  disabled = false,
}: {
  onClick: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
}) => {
  return (
    <ButtonAction
      icon={icon}
      color="red"
      tooltip="Eliminar"
      type="button"
      onClick={onClick}
      disabled={disabled}
    />
  );
};

export function SimpleDeleteDialog({
  onConfirm,
  open,
  onOpenChange,
  description,
}: SimpleDeleteDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar registro</DialogTitle>
          <DialogDescription>
            {description ??
              "Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro?"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
