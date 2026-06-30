import { useState } from "react";
import {
  Send,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
} from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { formatDateTime, errorToast, successToast } from "@/core/core.function";
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import {
  addAccountComment,
  updateAccountComment,
  deleteAccountComment,
} from "../lib/accountsReceivable.actions";
import type { AccountReceivableComment } from "../lib/accountsReceivable.interface";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const TRUNCATE_LIMIT = 180;

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
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface CommentItemProps {
  comment: AccountReceivableComment;
  canUpdate: boolean;
  isOwn: boolean;
  isLast: boolean;
  onEdit: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function CommentItem({
  comment,
  canUpdate,
  isOwn,
  isLast,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const editable = canUpdate && isToday(comment.created_at) && comment.id !== 0;
  const name = comment.user?.name ?? "Usuario";
  const align = isOwn ? "end" : "start";

  const isLong = comment.comment.length > TRUNCATE_LIMIT;
  const preview = comment.comment.slice(0, TRUNCATE_LIMIT) + "…";

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
      <Message align={align}>
        {/* Avatar with name tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <MessageAvatar>
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-[11px] font-bold cursor-default select-none",
                  avatarColor(name),
                )}
              >
                {getInitials(name)}
              </div>
            </MessageAvatar>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isOwn ? "Tú" : name}
            {!isOwn && comment.sede && ` · ${comment.sede.abreviatura}`}
          </TooltipContent>
        </Tooltip>

        <MessageContent>
          <BubbleGroup className="w-full">
            {editing ? (
              <div className="space-y-1.5 w-full">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={2}
                  className="text-xs resize-none w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      handleSaveEdit();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <div className="flex items-center justify-between gap-1">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <Check className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {formatDateTime(comment.created_at)}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <Bubble variant={isOwn ? "tinted" : "muted"} align={align}>
                <BubbleContent className="text-xs w-full">
                  <Collapsible open={expanded} onOpenChange={setExpanded}>
                    {expanded || !isLong ? comment.comment : preview}
                    {isLong && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="link"
                          className="gap-1 p-0 h-auto text-[10px] text-muted-foreground"
                        >
                          {expanded ? "Ver menos" : "Ver más"}
                          <ChevronDown
                            className={`size-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </Collapsible>
                </BubbleContent>

                <BubbleReactions
                  className="p-0"
                  align={isOwn ? "end" : "start"}
                  side="bottom"
                >
                  <Badge size="xxs">{formatDateTime(comment.created_at)}</Badge>
                </BubbleReactions>
              </Bubble>
            )}
          </BubbleGroup>

          {/* Edit / delete actions — visible on hover */}
          {editable && !editing && (
            <MessageFooter className="gap-0.5 opacity-0 group-hover/message:opacity-100 transition-opacity duration-150">
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={loading}
                title="Editar"
                aria-label="Editar"
                onClick={() => {
                  setEditText(comment.comment);
                  setEditing(true);
                }}
              >
                <Pencil className="size-3" />
              </Button>
              <ConfirmationDialog
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={loading}
                    title="Eliminar"
                    aria-label="Eliminar"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                }
                title="¿Eliminar comentario?"
                description="Esta acción no se puede deshacer."
                confirmText="Sí, eliminar"
                cancelText="Cancelar"
                onConfirm={handleDelete}
                variant="destructive"
                icon="danger"
              />
            </MessageFooter>
          )}
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
  const loggedUser = useAuthStore((s) => s.user);
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [localComments, setLocalComments] = useState<
    AccountReceivableComment[]
  >([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const comments = commentsLoaded ? localComments : initialComments;
  const syncBase = () => (commentsLoaded ? localComments : initialComments);

  const displayComments = [...comments].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
      setLocalComments(
        syncBase().map((c) => (c.id === id ? { ...c, comment: text } : c)),
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
      setLocalComments(syncBase().filter((c) => c.id !== id));
      setCommentsLoaded(true);
      successToast("Comentario eliminado.");
    } catch {
      errorToast("No se pudo eliminar el comentario.");
    }
  };

  return (
    <Card className="gap-0 py-0 h-full">
      {/* Header */}
      <CardHeader className="px-4 py-3 border-b [.border-b]:pb-1">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <MessageSquare className="size-4 text-muted-foreground" />
          Comentarios
          <span className="text-muted-foreground font-normal">
            ({comments.length})
          </span>
        </CardTitle>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        {displayComments.length > 0 ? (
          <MessageScrollerProvider>
            <MessageScroller className="h-full">
              <MessageScrollerViewport className="px-3 py-2">
                <MessageScrollerContent className="gap-3">
                  {displayComments.map((c, i) => (
                    <CommentItem
                      key={c.id}
                      comment={c}
                      canUpdate={canUpdate}
                      isOwn={loggedUser?.id === c.user_id}
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
          <Empty className="h-full border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageSquare />
              </EmptyMedia>
              <EmptyTitle className="text-sm">Sin comentarios</EmptyTitle>
              <EmptyDescription className="text-xs">
                Agrega el primer comentario para este comprobante.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>

      {/* Input */}
      {canUpdate && (
        <div className="px-3 pb-3 pt-2">
          <div className="relative">
            <Textarea
              placeholder="Escribir un comentario... (Ctrl+Enter para guardar)"
              rows={3}
              value={newComment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNewComment(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleSaveComment();
              }}
              disabled={isSaving}
              className="text-sm resize-none rounded-2xl p-4 bg-muted border-0 focus-visible:ring-0 shadow-none"
            />
            <Button
              type="button"
              size="icon"
              variant="default"
              disabled={!newComment.trim() || isSaving}
              onClick={handleSaveComment}
              aria-label="Guardar comentario"
              className="absolute bottom-2 right-2 size-7"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
