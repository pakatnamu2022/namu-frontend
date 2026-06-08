import { useState } from "react";
import { MessageSquare, Send, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccountReceivable } from "../lib/accountsReceivable.interface";

interface Props {
  open: boolean;
  selectedRecords: AccountReceivable[];
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
}

export default function BulkCommentModal({
  open,
  selectedRecords,
  onClose,
  onSubmit,
}: Props) {
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    if (isSaving) return;
    setComment("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!comment.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSubmit(comment.trim());
      setComment("");
    } finally {
      setIsSaving(false);
    }
  };

  const count = selectedRecords.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            Agregar comentario masivo
          </DialogTitle>
          <DialogDescription>
            El comentario se agregará a{" "}
            <strong>{count}</strong>{" "}
            {count === 1 ? "comprobante" : "comprobantes"}.
          </DialogDescription>
        </DialogHeader>

        {/* Preview de documentos */}
        <div className="rounded-lg border bg-muted/40 overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-muted/60">
            <FileText className="size-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Comprobantes seleccionados
            </span>
          </div>
          <ScrollArea className={count > 5 ? "h-40" : undefined}>
            <div className="divide-y divide-border/60">
              {selectedRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 gap-3"
                >
                  <span className="text-xs font-mono font-medium text-foreground shrink-0">
                    {r.document_number}
                  </span>
                  <span className="text-xs text-muted-foreground truncate text-right">
                    {r.client_name}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Textarea
          placeholder="Escribe el comentario para todos los comprobantes..."
          className="resize-none"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSubmit();
            }
          }}
          disabled={isSaving}
        />

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || isSaving}
            className="gap-1.5"
          >
            <Send className="size-3.5" />
            {isSaving ? "Enviando..." : "Agregar comentario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
