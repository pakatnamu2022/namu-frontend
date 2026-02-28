"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertTriangle, BadgeInfo, X } from "lucide-react";
import { ReactNode, useState } from "react";

interface ConfirmationDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  icon?: "warning" | "danger" | "info";
  children?: ReactNode;
  confirmDisabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ConfirmationDialog = ({
  trigger,
  title = "¿Estás seguro?",
  description = "Se perderán todos los datos ingresados en el formulario. ¿Estás seguro de que deseas cancelar?",
  confirmText = "Sí, cancelar",
  cancelText = "No, continuar",
  onConfirm,
  variant = "default",
  icon = "warning",
  children,
  confirmDisabled = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ConfirmationDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useIsMobile();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? (controlledOnOpenChange || (() => {})) : setInternalOpen;

  const handleConfirm = () => {
    setIsOpen(false);
    onConfirm();
  };

  const IconComponent =
    icon === "danger" ? X : icon === "warning" ? AlertTriangle : BadgeInfo;
  const iconColor =
    icon === "danger"
      ? "text-red-500"
      : icon === "warning"
      ? "text-amber-500"
      : "text-blue-500";

  const iconBgColor =
    icon === "danger"
      ? "bg-red-100"
      : icon === "warning"
      ? "bg-amber-100"
      : "bg-blue-100";

  const IconHeader = (
    <div className="flex items-center gap-3">
      <div className={`rounded-full p-2 ${iconBgColor}`}>
        <IconComponent className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="text-left font-semibold">{title}</div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={setIsOpen}
        dismissible={false}
      >
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DrawerHeader>
            {IconHeader}
            <DrawerDescription className="text-left mt-2">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          {children && <div className="px-4">{children}</div>}
          <DrawerFooter className="flex-col gap-2">
            <Button
              onClick={handleConfirm}
              disabled={confirmDisabled}
              className={
                variant === "destructive"
                  ? "bg-secondary hover:bg-red-700 text-white"
                  : ""
              }
            >
              {confirmText}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">{cancelText}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          {IconHeader}
        </AlertDialogHeader>
        <AlertDialogDescription className="text-left">
          {description}
        </AlertDialogDescription>
        {children && <div className="mt-4">{children}</div>}
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className={
              variant === "destructive"
                ? "bg-secondary hover:bg-red-700 text-white"
                : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
