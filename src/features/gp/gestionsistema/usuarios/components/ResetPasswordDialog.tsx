"use client";

import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";

interface ResetPasswordDialogProps {
  onConfirm: () => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}

export function ResetPasswordDialog({
  onConfirm,
  open,
  onOpenChange,
  userName,
}: ResetPasswordDialogProps) {
  const description = userName
    ? `¿Estás seguro de que deseas restablecer la contraseña de ${userName}? Esta acción generará una nueva contraseña temporal para el usuario.`
    : "¿Estás seguro de que deseas restablecer la contraseña de este usuario? Esta acción generará una nueva contraseña temporal para el usuario.";

  return (
    <ConfirmationDialog
      trigger={<span />}
      open={open}
      onOpenChange={onOpenChange}
      title="Restablecer contraseña"
      description={description}
      confirmText="Confirmar"
      cancelText="Cancelar"
      onConfirm={onConfirm}
      icon="warning"
    />
  );
}
