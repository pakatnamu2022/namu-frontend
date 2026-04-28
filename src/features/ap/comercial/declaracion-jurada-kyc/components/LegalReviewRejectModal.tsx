"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useRejectLegalReview } from "../lib/declaracionJuradaKyc.hook";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";
import { errorToast } from "@/core/core.function";

const MIN_COMMENT_LENGTH = 10;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declaration: CustomerKycDeclarationResource;
  onSuccess?: () => void;
}

export default function LegalReviewRejectModal({
  open,
  onOpenChange,
  declaration,
  onSuccess,
}: Props) {
  const [comments, setComments] = useState("");
  const { mutate, isPending } = useRejectLegalReview();

  const handleSubmit = () => {
    const trimmed = comments.trim();
    if (!trimmed) {
      errorToast("El motivo de rechazo es obligatorio");
      return;
    }
    if (trimmed.length < MIN_COMMENT_LENGTH) {
      errorToast(`El motivo debe tener al menos ${MIN_COMMENT_LENGTH} caracteres`);
      return;
    }
    mutate(
      { id: declaration.id, comments: trimmed },
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

  const remaining = MIN_COMMENT_LENGTH - comments.trim().length;

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Rechazar revisión legal"
      subtitle={`${declaration.full_name} — DJ #${declaration.id}`}
      size="xl"
      icon="XCircle"
      childrenFooter={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Rechazando..." : "Confirmar rechazo"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Indique el motivo por el cual se rechaza la revisión legal. Este
          campo es{" "}
          <span className="font-semibold text-destructive">obligatorio</span>.
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="reject-comments">
            Motivo de rechazo <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="reject-comments"
            placeholder="Describa el motivo del rechazo..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            disabled={isPending}
            className="resize-none"
          />
          {remaining > 0 && comments.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Mínimo {remaining} caractere{remaining !== 1 ? "s" : ""} más
            </p>
          )}
          {comments.trim().length >= MIN_COMMENT_LENGTH && (
            <p className="text-xs text-green-600">
              {comments.trim().length} caracteres
            </p>
          )}
        </div>
      </div>
    </GeneralModal>
  );
}
