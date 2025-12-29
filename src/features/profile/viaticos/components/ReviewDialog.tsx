"use client";

import { useState } from "react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReviewDialogProps {
  isOpen: boolean;
  reviewAction: "approved" | "rejected" | null;
  comments: string;
  onCommentsChange: (value: string) => void;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ReviewDialog({
  isOpen,
  reviewAction,
  comments,
  onCommentsChange,
  onConfirm,
  onCancel,
}: ReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmationDialog
      trigger={<div />}
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onCancel()}
      title={
        reviewAction === "approved"
          ? "Aprobar Solicitud"
          : "Rechazar Solicitud"
      }
      description={
        reviewAction === "approved"
          ? "¿Está seguro de aprobar esta solicitud de viáticos?"
          : "¿Está seguro de rechazar esta solicitud de viáticos?"
      }
      confirmText={reviewAction === "approved" ? "Aprobar" : "Rechazar"}
      cancelText="Cancelar"
      onConfirm={handleConfirm}
      variant={reviewAction === "approved" ? "default" : "destructive"}
      icon={reviewAction === "approved" ? "info" : "danger"}
      confirmDisabled={
        isSubmitting || (reviewAction === "rejected" && !comments.trim())
      }
    >
      <div className="space-y-2">
        <Label htmlFor="comments">
          Comentarios {reviewAction === "rejected" && "(Requerido)"}
        </Label>
        <Textarea
          id="comments"
          placeholder="Ingrese sus comentarios aquí..."
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
      </div>
    </ConfirmationDialog>
  );
}
