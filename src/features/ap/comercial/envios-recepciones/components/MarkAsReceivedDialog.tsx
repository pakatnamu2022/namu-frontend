"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import RequiredField from "@/src/shared/components/RequiredField";

interface MarkAsReceivedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note?: string) => void;
  isLoading?: boolean;
}

export const MarkAsReceivedDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: MarkAsReceivedDialogProps) => {
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    onConfirm(note || undefined);
    setNote(""); // Limpiar la nota después de confirmar
  };

  const handleCancel = () => {
    setNote(""); // Limpiar la nota al cancelar
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-blue-100">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Marcar como Recibido
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left mt-2">
          ¿Está seguro de que desea marcar esta guía de traslado como recibida?
          Esta acción registrará la recepción del envío.
        </AlertDialogDescription>
        <div className="space-y-2 mt-4">
          <Label htmlFor="note" className="text-sm font-medium">
            Nota <RequiredField />
          </Label>
          <Textarea
            id="note"
            placeholder="Ingrese una nota sobre la recepción..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={isLoading}
          />
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel
            className="mt-0"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-primary text-white"
          >
            {isLoading ? "Procesando..." : "Confirmar Recepción"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
