import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Link2, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import { regenerateConfirmationToken } from "../lib/quotationMeson.actions";

interface VirtualConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  confirmationLink: string;
  sentTo: string;
  expiresAt: string;
  quotationId: number;
}

export function VirtualConfirmationDialog({
  open,
  onClose,
  confirmationLink,
  sentTo,
  expiresAt,
  quotationId,
}: VirtualConfirmationDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentLink, setCurrentLink] = useState(confirmationLink);
  const [currentSentTo] = useState(sentTo);
  const [currentExpiresAt, setCurrentExpiresAt] = useState(expiresAt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      errorToast("No se pudo copiar el link");
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const result = await regenerateConfirmationToken(quotationId);
      if (result.success) {
        setCurrentLink(result.confirmation_link);
        setCurrentExpiresAt(result.expires_at);
        successToast("Token regenerado exitosamente");
      }
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al regenerar el token",
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-emerald-600" />
            Link de Confirmación Virtual
          </DialogTitle>
          <DialogDescription>
            El link fue enviado al cliente por email. También puedes copiarlo y
            compartirlo manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Enviado a */}
          <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Enviado a</p>
              <p className="text-sm font-medium">{currentSentTo}</p>
            </div>
          </div>

          {/* Expiración */}
          <div className="text-xs text-muted-foreground text-center">
            Expira el{" "}
            <span className="font-medium text-foreground">
              {new Date(currentExpiresAt).toLocaleDateString("es-PE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* Link */}
          <div className="bg-muted/30 border rounded-lg p-3 space-y-2">
            <p className="text-xs text-muted-foreground">
              Link de confirmación
            </p>
            <p className="text-xs break-all text-foreground font-mono">
              {currentLink}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              tooltip="Regenerar token (útil si el anterior expiró)"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <Button className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
