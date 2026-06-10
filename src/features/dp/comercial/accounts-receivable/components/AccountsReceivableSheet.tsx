import { useState } from "react";
import {
  Send,
  MessageSquare,
  User,
  Building2,
  Calendar,
  Hash,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  formatDate,
  formatDateTime,
  errorToast,
  successToast,
} from "@/core/core.function";
import { useAccountReceivableById } from "../lib/accountsReceivable.hook";
import {
  addAccountComment,
  updateAccountComment,
  deleteAccountComment,
} from "../lib/accountsReceivable.actions";
import {
  OVERDUE_STATUS_COLORS,
  DEFAULT_OVERDUE_STATUS_COLOR,
} from "../lib/accountsReceivable.constants";
import type { AccountReceivableComment } from "../lib/accountsReceivable.interface";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: number | null;
  open: boolean;
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

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface CommentItemProps {
  comment: AccountReceivableComment;
  onEdit: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [loading, setLoading] = useState(false);

  const editable = isToday(comment.created_at) && comment.id !== 0;
  const name = comment.user?.name ?? "Usuario";
  const initials = getInitials(name);
  const color = avatarColor(name);

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.trim() === comment.comment) {
      setEditing(false);
      setEditText(comment.comment);
      return;
    }
    setLoading(true);
    try {
      await onEdit(comment.id, editText.trim());
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditText(comment.comment);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(comment.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 py-3">
      <div
        className={cn(
          "size-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5",
          color,
        )}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold truncate">{name}</span>
          {comment.sede && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {comment.sede.abreviatura}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
            {formatDateTime(comment.created_at)}
          </span>
          {editable && !editing && (
            <ButtonGroup>
              <ButtonAction
                icon={Pencil}
                disabled={loading}
                onClick={() => {
                  setEditText(comment.comment);
                  setEditing(true);
                }}
              />
              <ConfirmationDialog
                trigger={
                  <ButtonAction
                    icon={Trash2}
                    color="red"
                    disabled={loading}
                  />
                }
                title="¿Eliminar comentario?"
                description="Esta acción no se puede deshacer. ¿Deseas eliminar este comentario?"
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleDelete}
                variant="destructive"
                icon="danger"
              />
            </ButtonGroup>
          )}
        </div>

        {editing ? (
          <div className="space-y-1.5">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={2}
              className="text-xs resize-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                className="h-6 px-2 text-[11px] gap-1"
                disabled={loading}
                onClick={handleSaveEdit}
              >
                <Check className="size-3" />
                Guardar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] gap-1"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                <X className="size-3" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-foreground/80 leading-relaxed wrap-break-word">
            {comment.comment}
          </p>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className="text-xs text-right">{value ?? "-"}</span>
    </div>
  );
}

export default function AccountsReceivableSheet({
  selectedId,
  open,
  onClose,
}: Props) {
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localComments, setLocalComments] = useState<AccountReceivableComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const { data: account, isLoading } = useAccountReceivableById(selectedId);

  const comments = commentsLoaded ? localComments : (account?.comments ?? []);

  const handleClose = () => {
    setNewComment("");
    setLocalComments([]);
    setCommentsLoaded(false);
    onClose();
  };

  const syncBase = () =>
    commentsLoaded ? localComments : (account?.comments ?? []);

  const handleSaveComment = async () => {
    if (!newComment.trim() || !selectedId) return;
    setIsSaving(true);
    try {
      const created = await addAccountComment(selectedId, newComment.trim());
      setLocalComments([created, ...syncBase()]);
      setCommentsLoaded(true);
      setNewComment("");
      successToast("Comentario guardado correctamente.");
    } catch {
      errorToast("No se pudo guardar el comentario.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditComment = async (id: number, text: string) => {
    try {
      await updateAccountComment(id, text);
      const base = syncBase();
      setLocalComments(
        base.map((c) => (c.id === id ? { ...c, comment: text } : c)),
      );
      setCommentsLoaded(true);
      successToast("Comentario actualizado.");
    } catch {
      errorToast("No se pudo actualizar el comentario.");
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteAccountComment(id);
      const base = syncBase();
      setLocalComments(base.filter((c) => c.id !== id));
      setCommentsLoaded(true);
      successToast("Comentario eliminado.");
    } catch {
      errorToast("No se pudo eliminar el comentario.");
    }
  };

  const statusColor = account
    ? (OVERDUE_STATUS_COLORS[account.overdue_status] ?? DEFAULT_OVERDUE_STATUS_COLOR)
    : "";

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Detalle de cuenta por cobrar"
      subtitle={account?.document_number}
      icon="FileText"
      size="4xl"
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

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {/* Document */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="size-3" /> Documento
                </h3>
                <div className="rounded-lg border bg-card p-2">
                  <DetailRow label="Número" value={account.document_number} />
                  <DetailRow label="Cajero" value={account.cashier} />
                  <DetailRow
                    label="Fecha documento"
                    value={formatDate(account.document_date)}
                  />
                  <DetailRow
                    label="Fecha vencimiento"
                    value={formatDate(account.document_due_date)}
                  />
                  <DetailRow
                    label="Mes vencimiento"
                    value={`${account.due_month} ${account.due_year}`}
                  />
                  <DetailRow
                    label="Fecha cobro"
                    value={
                      account.collection_date
                        ? formatDate(account.collection_date)
                        : null
                    }
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
            </div>

            <div className="flex flex-col gap-4">
              {/* Amounts */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="size-3" /> Importes
                </h3>
                <div className="rounded-lg border bg-card p-2">
                  <DetailRow label="Moneda" value={account.currency} />
                  <DetailRow
                    label="Tipo de cambio"
                    value={parseFloat(account.exchange_rate).toFixed(5)}
                  />
                  <DetailRow
                    label="Importe original"
                    value={`${account.currency} ${formatAmount(account.amount)}`}
                  />
                  <DetailRow
                    label="Saldo pendiente"
                    value={
                      <span className="font-bold">
                        {account.currency} {formatAmount(account.balance)}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Importe original (Soles)"
                    value={`S/ ${formatAmount(account.amount_pen)}`}
                  />
                  <DetailRow
                    label="Saldo pendiente (Soles)"
                    value={
                      <span className="font-bold text-primary">
                        S/ {formatAmount(account.balance_pen)}
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
                  <DetailRow
                    label="Última sincronización"
                    value={formatDateTime(account.synced_at)}
                  />
                </div>
              </section>
            </div>
          </div>

          {/* Comments */}
          <section>
            <Separator />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2 flex items-center gap-1">
              <MessageSquare className="size-3" /> Comentarios ({comments.length})
            </h3>

            {comments.length > 0 ? (
              <div className="rounded-xl bg-muted/40 px-3 divide-y divide-border/50">
                {comments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                Sin comentarios aún.
              </p>
            )}

            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Escribir un comentario... (Ctrl+Enter para guardar)"
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
