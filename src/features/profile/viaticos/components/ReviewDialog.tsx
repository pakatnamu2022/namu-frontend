"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReviewDialogProps {
  isOpen: boolean;
  reviewAction: "approved" | "rejected" | null;
  comments: string;
  onCommentsChange: (value: string) => void;
  onConfirm: () => void;
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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {reviewAction === "approved"
              ? "Aprobar Solicitud"
              : "Rechazar Solicitud"}
          </DialogTitle>
          <DialogDescription>
            {reviewAction === "approved"
              ? "¿Está seguro de aprobar esta solicitud de viáticos?"
              : "¿Está seguro de rechazar esta solicitud de viáticos?"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant={reviewAction === "approved" ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={reviewAction === "rejected" && !comments.trim()}
          >
            {reviewAction === "approved" ? "Aprobar" : "Rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
