"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useConfirmLegalReview } from "../lib/declaracionJuradaKyc.hook";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declaration: CustomerKycDeclarationResource;
  onSuccess?: () => void;
}

export default function LegalReviewConfirmModal({
  open,
  onOpenChange,
  declaration,
  onSuccess,
}: Props) {
  const [comments, setComments] = useState("");
  const { mutate, isPending } = useConfirmLegalReview();

  const handleSubmit = () => {
    mutate(
      { id: declaration.id, comments: comments.trim() || undefined },
      {
        onSuccess: () => {
          setComments("");
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  const handleClose = () => {
    if (isPending) return;
    setComments("");
    onOpenChange(false);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Confirmar revisión legal"
      subtitle={`${declaration.full_name} — DJ #${declaration.id}`}
      size="xl"
      icon="CheckCircle"
      childrenFooter={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            color="green"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Confirmando..." : "Confirmar revisión"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          ¿Está seguro de que desea confirmar la revisión legal de este
          documento? Esta acción marcará el documento como aprobado.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-comments">
            Observaciones <span className="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Textarea
            id="confirm-comments"
            placeholder="Ingrese observaciones adicionales si lo considera necesario..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            disabled={isPending}
            className="resize-none"
          />
        </div>
      </div>
    </GeneralModal>
  );
}
