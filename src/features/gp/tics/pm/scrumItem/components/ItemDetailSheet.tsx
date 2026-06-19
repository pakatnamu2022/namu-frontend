"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  MessageSquare,
  History,
  Minus,
  Send,
  User,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useScrumItemById } from "../lib/scrumItem.hook";
import { updateScrumItem } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.actions";
import {
  storeScrumComment,
  deleteScrumComment,
} from "@/features/gp/tics/pm/scrumComment/lib/scrumComment.actions";
import {
  ScrumItemType,
  ScrumItemPriority,
  ScrumItemStatus,
  ScrumItemDetail,
} from "../lib/scrumItem.interface";
import GeneralSheet from "@/shared/components/GeneralSheet";

const TYPE_LABEL: Record<ScrumItemType, string> = {
  tarea: "Tarea",
  historia: "Historia",
  funcion: "Función",
  solicitud: "Solicitud",
  error: "Error",
};

const STATUS_LABEL: Record<ScrumItemStatus, string> = {
  backlog: "Backlog",
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  hecho: "Hecho",
};

const PRIORITY_ICON: Record<ScrumItemPriority, React.FC<any>> = {
  alta: ArrowUp,
  media: Minus,
  baja: ArrowDown,
};

const PRIORITY_COLOR: Record<ScrumItemPriority, string> = {
  alta: "text-red-500",
  media: "text-amber-500",
  baja: "text-blue-400",
};

interface EditState {
  title: string;
  description: string;
  status: ScrumItemStatus;
  priority: ScrumItemPriority | "";
  story_points: string;
  estimated_hours: string;
  due_date: string;
}

function initEdit(item: ScrumItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    status: item.status,
    priority: (item.priority as ScrumItemPriority) ?? "",
    story_points: item.story_points != null ? String(item.story_points) : "",
    estimated_hours: item.estimated_hours != null ? String(item.estimated_hours) : "",
    due_date: item.due_date ?? "",
  };
}

interface Props {
  itemId: number | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDetailSheet({ itemId, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const { data: item, isLoading } = useScrumItemById(itemId);

  const commentMutation = useMutation({
    mutationFn: () =>
      storeScrumComment({ item_id: itemId!, content: comment }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["scrumItem", itemId] });
    },
    onError: () => errorToast("Error al agregar comentario"),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteScrumComment,
    onSuccess: () => {
      successToast("Comentario eliminado");
      queryClient.invalidateQueries({ queryKey: ["scrumItem", itemId] });
    },
    onError: () => errorToast("Error al eliminar comentario"),
  });

  const updateMutation = useMutation({
    mutationFn: (state: EditState) =>
      updateScrumItem(itemId!, {
        title: state.title,
        description: state.description || undefined,
        status: state.status,
        priority: state.priority || undefined,
        story_points: state.story_points ? Number(state.story_points) : null,
        estimated_hours: state.estimated_hours ? Number(state.estimated_hours) : null,
        due_date: state.due_date || null,
      }),
    onSuccess: () => {
      successToast("Item actualizado");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["scrumItem", itemId] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
    },
    onError: () => errorToast("Error al actualizar el item"),
  });

  const priority = item?.priority as ScrumItemPriority | undefined;
  const PriorityIcon = priority ? PRIORITY_ICON[priority] : Minus;

  const startEdit = () => {
    if (item) {
      setEditState(initEdit(item));
      setEditing(true);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditState(null);
  };

  const handleClose = () => {
    cancelEdit();
    onClose();
  };

  const set = (field: keyof EditState, value: string) =>
    setEditState((s) => s ? { ...s, [field]: value } : s);

  const footer = item ? (
    editing ? (
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          disabled={!editState?.title.trim() || updateMutation.isPending}
          onClick={() => editState && updateMutation.mutate(editState)}
        >
          <Check className="size-3.5 mr-1" /> Guardar
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelEdit}>
          <X className="size-3.5 mr-1" /> Cancelar
        </Button>
      </div>
    ) : (
      <Button variant="outline" size="sm" onClick={startEdit}>
        <Pencil className="size-3.5 mr-1" /> Editar
      </Button>
    )
  ) : null;

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={isLoading ? "Cargando..." : item?.title ?? "Detalle del item"}
      icon="LayoutList"
      size="2xl"
      modal={false}
      isLoading={isLoading && open}
      childrenFooter={footer}
    >
      {item && !editing && (
        <div className="space-y-6 pb-4">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{TYPE_LABEL[item.type as ScrumItemType]}</Badge>
            <Badge variant="outline">{STATUS_LABEL[item.status as ScrumItemStatus]}</Badge>
            {priority && (
              <Badge variant="outline" className={`gap-1 ${PRIORITY_COLOR[priority]}`}>
                <PriorityIcon className="size-3" />
                {priority}
              </Badge>
            )}
            {item.story_points !== undefined && item.story_points !== null && (
              <Badge variant="outline">{item.story_points} pts</Badge>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <p className="text-sm font-medium mb-1">Descripción</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          {/* Meta info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.project && (
              <div>
                <p className="text-xs text-muted-foreground">Proyecto</p>
                <p className="font-medium">{item.project.name}</p>
              </div>
            )}
            {item.sprint && (
              <div>
                <p className="text-xs text-muted-foreground">Sprint</p>
                <p className="font-medium">{item.sprint.name}</p>
              </div>
            )}
            {item.assignee && (
              <div className="flex items-center gap-1">
                <User className="size-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Asignado a</p>
                  <p className="font-medium">{item.assignee.name}</p>
                </div>
              </div>
            )}
            {item.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha límite</p>
                  <p className="font-medium">{item.due_date}</p>
                </div>
              </div>
            )}
            {item.estimated_hours !== undefined && item.estimated_hours !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Horas estimadas</p>
                <p className="font-medium">{item.estimated_hours}h</p>
              </div>
            )}
            {item.actual_hours !== undefined && item.actual_hours !== null && (
              <div>
                <p className="text-xs text-muted-foreground">Horas reales</p>
                <p className="font-medium">{item.actual_hours}h</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                Comentarios ({item.comments?.length ?? 0})
              </p>
            </div>
            <div className="space-y-3">
              {item.comments?.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="size-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{c.user.name}</span>
                      <span className="text-xs text-muted-foreground">{c.created_at}</span>
                    </div>
                    <p className="text-sm mt-0.5 text-muted-foreground">{c.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => deleteCommentMutation.mutate(c.id)}
                  >
                    <AlertCircle className="size-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add comment */}
            <div className="mt-4 flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="min-h-[60px] text-sm resize-none"
              />
              <Button
                size="icon"
                className="shrink-0"
                disabled={!comment.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* History */}
          {item.history && item.history.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Historial</p>
              </div>
              <div className="space-y-2">
                {item.history.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{entry.user.name}</span>
                    <span>cambió</span>
                    <span className="font-medium">{entry.field}</span>
                    {entry.old_value && (
                      <>
                        <span>de</span>
                        <span className="bg-red-50 text-red-600 px-1 rounded">{entry.old_value}</span>
                      </>
                    )}
                    {entry.new_value && (
                      <>
                        <span>a</span>
                        <span className="bg-green-50 text-green-600 px-1 rounded">{entry.new_value}</span>
                      </>
                    )}
                    <span className="ml-auto shrink-0">{entry.created_at}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit form */}
      {item && editing && editState && (
        <div className="space-y-4 pb-4">
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input
              value={editState.title}
              onChange={(e) => set("title", e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Descripción</Label>
            <Textarea
              value={editState.description}
              onChange={(e) => set("description", e.target.value)}
              className="text-sm resize-none min-h-20"
              placeholder="Descripción del item..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Estado</Label>
              <Select value={editState.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="por_hacer">Por hacer</SelectItem>
                  <SelectItem value="en_progreso">En progreso</SelectItem>
                  <SelectItem value="en_revision">En revisión</SelectItem>
                  <SelectItem value="hecho">Hecho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Prioridad</Label>
              <Select value={editState.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue placeholder="Sin prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Story points</Label>
              <Input
                type="number"
                min={0}
                value={editState.story_points}
                onChange={(e) => set("story_points", e.target.value)}
                className="text-sm h-8"
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Horas estimadas</Label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={editState.estimated_hours}
                onChange={(e) => set("estimated_hours", e.target.value)}
                className="text-sm h-8"
                placeholder="0"
              />
            </div>

            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Fecha límite</Label>
              <Input
                type="date"
                value={editState.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className="text-sm h-8"
              />
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            {item.project && <p><span className="font-medium">Proyecto:</span> {item.project.name}</p>}
            {item.sprint && <p><span className="font-medium">Sprint:</span> {item.sprint.name}</p>}
            {item.assignee && <p><span className="font-medium">Asignado a:</span> {item.assignee.name}</p>}
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
