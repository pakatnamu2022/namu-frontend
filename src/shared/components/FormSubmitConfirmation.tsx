"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";

interface FormSubmitConfirmationProps {
  /** Título del diálogo de confirmación */
  title?: string;
  /** Descripción o mensaje de advertencia */
  description?: string;
  /** Texto del botón de confirmación */
  confirmText?: string;
  /** Texto del botón de cancelación */
  cancelText?: string;
  /** Texto del botón que dispara el diálogo */
  triggerText?: string;
  /** Icono del botón que dispara el diálogo */
  triggerIcon?: ReactNode;
  /** Variante del botón de confirmación */
  variant?: "default" | "destructive" | "warning";
  /** Tipo de icono a mostrar en el diálogo */
  icon?: "warning" | "info" | "danger";
  /** Si el botón está en estado de carga */
  isSubmitting?: boolean;
  /** Texto a mostrar cuando está enviando */
  submittingText?: string;
  /** Función a ejecutar al confirmar */
  onConfirm: () => void;
  /** Si el botón debe estar deshabilitado */
  disabled?: boolean;
  /** Tamaño del botón */
  size?: "default" | "sm" | "lg" | "icon";
}

export const FormSubmitConfirmation = ({
  title = "¿Confirmar acción?",
  description = "Una vez confirmada esta acción, no podrá ser revertida. ¿Está seguro de continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  triggerText = "Guardar",
  triggerIcon,
  variant = "default",
  icon = "warning",
  isSubmitting = false,
  submittingText = "Guardando...",
  onConfirm,
  disabled = false,
  size = "default",
}: FormSubmitConfirmationProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  const getIcon = () => {
    switch (icon) {
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case "danger":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case "info":
        return <Info className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "default";
      default:
        return variant;
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || isSubmitting}
        variant={getVariantStyles()}
        size={size}
      >
        {isSubmitting ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {submittingText}
          </>
        ) : (
          <>
            {triggerIcon && <span className="mr-2">{triggerIcon}</span>}
            {triggerText}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {getIcon()}
              <DialogTitle>{title}</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              {description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={getVariantStyles()}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
