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
import { LucideIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import RequiredField from "@/src/shared/components/RequiredField";

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  title: string;
  description: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  fieldLabel?: string;
  required?: boolean;
}

export const ReasonDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title,
  description,
  icon: Icon,
  iconBgColor = "bg-blue-100",
  iconColor = "text-primary",
  placeholder = "Ingrese una razón...",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  fieldLabel = "Razón",
  required = true,
}: ReasonDialogProps) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (required && !reason.trim()) return;
    onConfirm(reason);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${iconBgColor}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left mt-2">
          {description}
        </AlertDialogDescription>
        <div className="space-y-2 mt-4">
          <Label htmlFor="reason" className="text-sm font-medium">
            {fieldLabel} {required && <RequiredField />}
          </Label>
          <Textarea
            id="reason"
            placeholder={placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || (required && !reason.trim())}
            className="bg-primary text-white"
          >
            {isLoading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
