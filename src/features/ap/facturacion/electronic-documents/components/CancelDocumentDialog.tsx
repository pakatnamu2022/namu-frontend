import { useState } from "react";
import { Ban, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AnnulDocumentDialogProps {
  onConfirm: (reason: string) => void;
  trigger: React.ReactNode;
  onPreCancel?: () => Promise<void>;
}

export function AnnulDocumentDialog({
  onConfirm,
  trigger,
  onPreCancel,
}: AnnulDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleTriggerClick = async () => {
    if (onPreCancel) {
      setIsValidating(true);
      try {
        await onPreCancel();
        setOpen(true);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Documento no encontrado en Dynamics"
        );
      } finally {
        setIsValidating(false);
      }
    } else {
      setOpen(true);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setReason("");
      setError("");
    }
  };

  const handleConfirm = () => {
    // Validar que la razón tenga entre 10 y 250 caracteres
    if (reason.trim().length < 10) {
      setError("La razón debe tener al menos 10 caracteres");
      return;
    }
    if (reason.trim().length > 250) {
      setError("La razón no puede exceder los 250 caracteres");
      return;
    }

    onConfirm(reason.trim());
    setOpen(false);
    setReason("");
    setError("");
  };

  const handleAnnul = () => {
    setOpen(false);
    setReason("");
    setError("");
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (error) {
      setError("");
    }
  };

  return (
    <>
      {isValidating ? (
        <Button variant="outline" size="icon" className="size-7" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      ) : (
        <div onClick={handleTriggerClick}>{trigger}</div>
      )}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" />
              Anular Documento en Nubefact
            </DialogTitle>
            <DialogDescription>
              Esta acción anulará el documento en Nubefact. Ingrese la razón de
              la anulación (mínimo 10 caracteres, máximo 250 caracteres).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Razón de anulación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Escriba la razón de la anulación..."
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                className={`min-h-[120px] ${error ? "border-red-500" : ""}`}
                maxLength={250}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {reason.length}/250 caracteres
                  {reason.length > 0 && reason.length < 10 && (
                    <span className="text-orange-600 ml-2">
                      (mínimo 10 caracteres)
                    </span>
                  )}
                </span>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleAnnul}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="destructive"
              disabled={reason.trim().length < 10}
            >
              Confirmar Anulación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
