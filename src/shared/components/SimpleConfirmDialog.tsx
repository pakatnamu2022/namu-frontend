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
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

interface SimpleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  icon?: "warning" | "danger" | "success";
  isLoading?: boolean;
}

export const SimpleConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  icon = "warning",
  isLoading = false,
}: SimpleConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const IconComponent =
    icon === "danger" ? X : icon === "success" ? CheckCircle2 : AlertTriangle;
  const iconColor =
    icon === "danger"
      ? "text-red-500"
      : icon === "success"
      ? "text-green-500"
      : "text-amber-500";
  const bgColor =
    icon === "danger"
      ? "bg-red-100"
      : icon === "success"
      ? "bg-green-100"
      : "bg-amber-100";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${bgColor}`}>
              <IconComponent className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left mt-2">
          {description}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0" disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : ""
            }
          >
            {isLoading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
