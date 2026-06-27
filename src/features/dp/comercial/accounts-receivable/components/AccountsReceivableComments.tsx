import { useState } from "react";
import { Send, MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from "@/components/ui/message";
import { Bubble, BubbleGroup, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Marker, MarkerIcon, MarkerContent } from "@/components/ui/marker";
import { formatDateTime, errorToast, successToast } from "@/core/core.function";
import {
  addAccountComment,
  updateAccountComment,
  deleteAccountComment,
} from "../lib/accountsReceivable.actions";
import type { AccountReceivableComment } from "../lib/accountsReceivable.interface";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

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

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface CommentItemProps {
  comment: AccountReceivableComment;
  canUpdate: boolean;
  isLast: boolean;
  onEdit: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function CommentItem({ comment, canUpdate, isLast, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [loading, setLoading] = useState(false);

  const editable = canUpdate && isToday(comment.created_at) && comment.id !== 0;
  const name = comment.user?.name ?? "Usuario";

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
    <MessageScrollerItem scrollAnchor={isLast}>
      <Message align="start">
        <MessageAvatar>
          <div
            className={cn(
              "size-8 rounded-full flex items-center justify-center text-[11px] font-bold",
              avatarColor(name)
            )}
          >
            {getInitials(name)}
          </div>
        </MessageAvatar>

        <MessageContent>
          <MessageHeader>
            <span className="font-semibold truncate">{name}</span>
            {comment.sede && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 ml-1 shrink-0">
                {comment.sede.abreviatura}
              </Badge>
            )}
            {editable && !editing && (
              <ButtonGroup className="ml-auto opacity-0 group-hover/message:opacity-100 transition-opacity duration-150">
                <ButtonAction
                  icon={Pencil}
                  disabled={loading}
                  onClick={() => {
                    setEditText(comment.comment);
                    setEditing(true);
                  }}
                />
                <ConfirmationDialog
                  trigger={<ButtonAction icon={Trash2} color="red" disabled={loading} />}
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
          </MessageHeader>

          <BubbleGroup>
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
                    <Check className="size-3" /> Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    <X className="size-3" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Bubble variant="muted" align="start">
                <BubbleContent className="text-xs">{comment.comment}</BubbleContent>
              </Bubble>
            )}
          </BubbleGroup>

          <MessageFooter>{formatDateTime(comment.created_at)}</MessageFooter>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  );
}

interface Props {
  selectedId: number;
  canUpdate: boolean;
  initialComments: AccountReceivableComment[];
}

export default function AccountsReceivableComments({
  selectedId,
  canUpdate,
  initialComments,
}: Props) {
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localComments, setLocalComments] = useState<AccountReceivableComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const comments = commentsLoaded ? localComments : initialComments;
  const syncBase = () => (commentsLoaded ? localComments : initialComments);

  // Display oldest → newest so the scroller auto-scrolls to the latest comment
  const displayComments = [...comments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleSaveComment = async () => {
    if (!newComment.trim()) return;
    setIsSaving(true);
    try {
      const created = await addAccountComment(selectedId, newComment.trim());
      setLocalComments([...syncBase(), created]);
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
      setLocalComments(syncBase().map((c) => (c.id === id ? { ...c, comment: text } : c)));
      setCommentsLoaded(true);
      successToast("Comentario actualizado.");
    } catch {
      errorToast("No se pudo actualizar el comentario.");
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteAccountComment(id);
      setLocalComments(syncBase().filter((c) => c.id !== id));
      setCommentsLoaded(true);
      successToast("Comentario eliminado.");
    } catch {
      errorToast("No se pudo eliminar el comentario.");
    }
  };

  return (
    <section>
      <Marker variant="separator" className="my-3">
        <MarkerIcon>
          <MessageSquare className="size-3.5" />
        </MarkerIcon>
        <MarkerContent className="text-xs font-semibold uppercase tracking-wider">
          Comentarios ({comments.length})
        </MarkerContent>
      </Marker>

      {displayComments.length > 0 ? (
        <MessageScrollerProvider>
          <MessageScroller className="max-h-80 rounded-xl bg-muted/30">
            <MessageScrollerViewport className="px-3 py-2">
              <MessageScrollerContent className="gap-3">
                {displayComments.map((c, i) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    canUpdate={canUpdate}
                    isLast={i === displayComments.length - 1}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-6">Sin comentarios aún.</p>
      )}

      {canUpdate && (
        <div className="mt-3 space-y-2">
          <Textarea
            placeholder="Escribir un comentario... (Ctrl+Enter para guardar)"
            className="text-sm resize-none"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSaveComment();
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
      )}
    </section>
  );
}
