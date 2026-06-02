import { useState } from "react";
import { Send, MessageSquare, User, Building2, Calendar, Hash } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDateTime, errorToast, successToast } from "@/core/core.function";
import { useAccountReceivableById } from "../lib/accountsReceivable.hook";
import { addAccountComment } from "../lib/accountsReceivable.actions";
import {
  OVERDUE_STATUS_COLORS,
  DEFAULT_OVERDUE_STATUS_COLOR,
} from "../lib/accountsReceivable.constants";
import type { AccountReceivableComment } from "../lib/accountsReceivable.interface";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: number | null;
  onClose: () => void;
}

function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "-";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

function CommentItem({ comment }: { comment: AccountReceivableComment }) {
  return (
    <div className="flex gap-2 py-2">
      <div className="shrink-0 mt-0.5 bg-primary/10 rounded-full p-1.5">
        <User className="size-3 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold truncate">{comment.user?.name ?? "Usuario"}</span>
          {comment.sede && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {comment.sede.abreviatura}
            </Badge>
          )}
        </div>
        <p className="text-xs text-foreground/80 wrap-break-word">{comment.comment}</p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatDateTime(comment.created_at)}
        </p>
      </div>
    </div>
  );
}

export default function AccountsReceivableSheet({ selectedId, onClose }: Props) {
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localComments, setLocalComments] = useState<AccountReceivableComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const { data: account, isLoading } = useAccountReceivableById(selectedId);

  const comments = commentsLoaded
    ? localComments
    : account?.comments ?? [];

  const handleClose = () => {
    setNewComment("");
    setLocalComments([]);
    setCommentsLoaded(false);
    onClose();
  };

  const handleSaveComment = async () => {
    if (!newComment.trim() || !selectedId) return;
    setIsSaving(true);
    try {
      await addAccountComment(selectedId, newComment.trim());
      const optimistic: AccountReceivableComment = {
        id: Date.now(),
        comment: newComment.trim(),
        sede_id: account?.sede_id ?? 0,
        sede: account?.sede ?? { id: 0, localidad: "", abreviatura: "" },
        user_id: 0,
        user: { id: 0, name: "Tú" },
        created_at: new Date().toISOString(),
      };
      const base = commentsLoaded ? localComments : (account?.comments ?? []);
      setLocalComments([optimistic, ...base]);
      setCommentsLoaded(true);
      setNewComment("");
      successToast("Comentario guardado correctamente.");
    } catch {
      errorToast("No se pudo guardar el comentario.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusColor = account
    ? (OVERDUE_STATUS_COLORS[account.overdue_status] ?? DEFAULT_OVERDUE_STATUS_COLOR)
    : "";

  return (
    <GeneralSheet
      open={!!selectedId}
      onClose={handleClose}
      title="Detalle de cuenta por cobrar"
      subtitle={account?.document_number}
      icon="FileText"
      size="2xl"
      isLoading={isLoading}
    >
      {account && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("border", statusColor)}>
              {account.overdue_status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Días vencidos: <strong>{account.overdue_days}</strong>
            </span>
          </div>

          {/* Document */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Hash className="size-3" /> Documento
            </h3>
            <div className="rounded-lg border bg-card p-2">
              <DetailRow label="Número" value={account.document_number} />
              <DetailRow label="Cajero" value={account.cashier} />
              <DetailRow label="Fecha documento" value={formatDate(account.document_date)} />
              <DetailRow label="Fecha vencimiento" value={formatDate(account.document_due_date)} />
              <DetailRow label="Mes vencimiento" value={`${account.due_month} ${account.due_year}`} />
              <DetailRow
                label="Fecha cobro"
                value={account.collection_date ? formatDate(account.collection_date) : null}
              />
            </div>
          </section>

          {/* Client */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <User className="size-3" /> Cliente
            </h3>
            <div className="rounded-lg border bg-card p-2">
              <DetailRow label="RUC / DNI" value={account.client_id} />
              <DetailRow label="Razón social" value={account.client_name} />
              {account.client_id_real && (
                <DetailRow label="RUC real" value={account.client_id_real} />
              )}
              {account.client_name_real && (
                <DetailRow label="Nombre real" value={account.client_name_real} />
              )}
            </div>
          </section>

          {/* Amounts */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="size-3" /> Importes
            </h3>
            <div className="rounded-lg border bg-card p-2">
              <DetailRow label="Moneda" value={account.currency} />
              <DetailRow label="Tipo de cambio" value={parseFloat(account.exchange_rate).toFixed(5)} />
              <DetailRow label="Importe original" value={`${account.currency} ${formatAmount(account.amount)}`} />
              <DetailRow
                label="Saldo pendiente"
                value={
                  <span className="font-bold text-primary">
                    {account.currency} {formatAmount(account.balance)}
                  </span>
                }
              />
            </div>
          </section>

          {/* Branch */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building2 className="size-3" /> Sucursal
            </h3>
            <div className="rounded-lg border bg-card p-2">
              <DetailRow label="Vendedor" value={account.seller} />
              <DetailRow label="Sede" value={account.sede?.localidad} />
              <DetailRow label="Sucursal" value={account.branch} />
              {account.observations && (
                <DetailRow label="Observaciones" value={account.observations} />
              )}
              <DetailRow label="Última sincronización" value={formatDateTime(account.synced_at)} />
            </div>
          </section>

          {/* Comments */}
          <section>
            <Separator />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2 flex items-center gap-1">
              <MessageSquare className="size-3" /> Comentarios ({comments.length})
            </h3>

            {comments.length > 0 ? (
              <div className="divide-y divide-border/50 rounded-lg border bg-card px-3">
                {comments.map((c) => (
                  <CommentItem key={c.id} comment={c} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                Sin comentarios aún.
              </p>
            )}

            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escribir un comentario..."
                className="text-sm resize-none"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    handleSaveComment();
                  }
                }}
              />
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!newComment.trim() || isSaving}
                onClick={handleSaveComment}
              >
                <Send className="size-3.5" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </GeneralSheet>
  );
}
