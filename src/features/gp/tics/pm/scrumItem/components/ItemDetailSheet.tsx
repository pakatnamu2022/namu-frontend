"use client";

import { Badge, BadgeColor } from "@/components/ui/badge";
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
  ListTree,
  RefreshCw,
  CalendarIcon,
  LucideIcon,
} from "lucide-react";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addWorkingDays,
  countWorkingDays,
  nextWorkingDay,
  SUNDAY_DISABLED_MATCHER,
} from "../lib/workingHours";
import { useScrumItemById, useScrumItems } from "../lib/scrumItem.hook";
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

const TYPE_COLOR: Record<ScrumItemType, BadgeColor> = {
  tarea: "indigo",
  historia: "green",
  funcion: "orange",
  solicitud: "amber",
  error: "red",
};

const STATUS_LABEL: Record<ScrumItemStatus, string> = {
  backlog: "Backlog",
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  hecho: "Hecho",
};

const STATUS_COLOR: Record<ScrumItemStatus, BadgeColor> = {
  backlog: "gray",
  por_hacer: "blue",
  en_progreso: "orange",
  en_revision: "violet",
  hecho: "green",
};

const PRIORITY_ICON: Record<ScrumItemPriority, LucideIcon> = {
  alta: ArrowUp,
  media: Minus,
  baja: ArrowDown,
};

const PRIORITY_COLOR: Record<ScrumItemPriority, BadgeColor> = {
  alta: "red",
  media: "amber",
  baja: "blue",
};

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

interface EditState {
  title: string;
  description: string;
  status: ScrumItemStatus;
  priority: ScrumItemPriority | "";
  story_points: string;
  estimated_hours: string;
  start_date: string;
  due_date: string;
  predecessor_id: string;
}

function initEdit(item: ScrumItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    status: item.status,
    priority: (item.priority as ScrumItemPriority) ?? "",
    story_points: item.story_points != null ? String(item.story_points) : "",
    estimated_hours:
      item.estimated_hours != null ? String(item.estimated_hours) : "",
    start_date: item.start_date ?? "",
    due_date: item.due_date ?? "",
    predecessor_id:
      item.predecessor_id != null ? String(item.predecessor_id) : "",
  };
}

const NO_PREDECESSOR = "none";

function parseLocalDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const parts = s.split("T")[0].split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

// Cuenta días laborables (lunes a sábado; domingo no cuenta).
function countDays(start?: string | null, end?: string | null): number | null {
  const from = parseLocalDate(start);
  const to = parseLocalDate(end);
  if (!from || !to) return null;
  const count = countWorkingDays(from, to);
  return count > 0 ? count : null;
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
  // La fecha fin ya no se edita a mano: la base siempre es la fecha de
  // inicio, y "días" (laborables) es lo único que se ajusta.
  const [days, setDays] = useState<number | "">(1);
  const { data: item, isLoading } = useScrumItemById(itemId);

  // Candidatos a predecesora: otros items del mismo proyecto (no hace falta
  // mientras no se esté editando).
  const { data: candidates } = useScrumItems(
    { project_id: item?.project.id, per_page: 200 },
    editing && item !== undefined,
  );
  // Solo se puede linkear predecesora entre items del mismo tipo (tarea con
  // tarea, historia con historia) y, entre tareas, de la misma historia
  // padre (mismo dominio) — igual que valida el backend.
  const predecessorOptions = (candidates?.data ?? []).filter(
    (i) =>
      i.id !== itemId &&
      i.type === item?.type &&
      (item?.type !== "tarea" || i.parent_id === item?.parent_id),
  );

  useEffect(() => {
    setEditing(false);
    setEditState(null);
    setComment("");
  }, [itemId]);

  const commentMutation = useMutation({
    mutationFn: () => storeScrumComment({ item_id: itemId!, content: comment }),
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
        estimated_hours: state.estimated_hours
          ? Number(state.estimated_hours)
          : null,
        start_date: state.start_date || null,
        due_date: state.due_date || null,
        predecessor_id:
          state.predecessor_id && state.predecessor_id !== NO_PREDECESSOR
            ? Number(state.predecessor_id)
            : null,
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

  // Reencadena las fechas de las tareas hijas de esta historia, una tras
  // otra a partir de la fecha de inicio de la historia, conservando la
  // duración que ya tenía cada tarea. Sirve tanto para acomodar tareas que
  // nunca tuvieron fecha propia como para recuadrar todo tras mover la
  // historia manualmente.
  const recalculateChildrenMutation = useMutation({
    mutationFn: (updates: { id: number; start_date: string; due_date: string }[]) =>
      Promise.all(
        updates.map((u) =>
          updateScrumItem(u.id, { start_date: u.start_date, due_date: u.due_date }),
        ),
      ),
    onSuccess: () => {
      successToast("Fechas de las tareas recalculadas");
      queryClient.invalidateQueries({ queryKey: ["scrumItem"] });
      queryClient.invalidateQueries({ queryKey: ["scrumKanban"] });
    },
    onError: () => errorToast("Error al recalcular las fechas"),
  });

  const handleRecalculateChildren = () => {
    if (!item || item.type !== "historia" || !item.children?.length) return;
    let cursor = nextWorkingDay(parseLocalDate(item.start_date) ?? new Date());
    const sortedChildren = [...item.children].sort((a, b) => a.order - b.order);
    const updates = sortedChildren.map((child) => {
      const durationDays = countDays(child.start_date, child.due_date) ?? 1;
      const start = cursor;
      const due = addWorkingDays(start, durationDays);
      cursor = nextWorkingDay(new Date(due.getFullYear(), due.getMonth(), due.getDate() + 1));
      return {
        id: child.id,
        start_date: format(start, "yyyy-MM-dd"),
        due_date: format(due, "yyyy-MM-dd"),
      };
    });
    recalculateChildrenMutation.mutate(updates);
  };

  const priority = item?.priority as ScrumItemPriority | undefined;
  const PriorityIcon = priority ? PRIORITY_ICON[priority] : Minus;

  const startEdit = () => {
    if (item) {
      const state = initEdit(item);
      setEditState(state);
      setDays(countDays(state.start_date, state.due_date) ?? 1);
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
    setEditState((s) => (s ? { ...s, [field]: value } : s));

  // due_date siempre se deriva de start_date + días laborables, sea que
  // cambie la fecha de inicio o el número de días.
  const applyDuration = (startDateStr: string, newDays: number | "") => {
    const from = parseLocalDate(startDateStr);
    if (!from || !newDays || newDays < 1) return;
    set("due_date", format(addWorkingDays(from, newDays), "yyyy-MM-dd"));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    const str = date ? format(date, "yyyy-MM-dd") : "";
    set("start_date", str);
    if (str) applyDuration(str, days);
  };

  const handleDaysChange = (value: string) => {
    const n = Number(value);
    const newDays = !value || Number.isNaN(n) || n < 1 ? "" : n;
    setDays(newDays);
    if (editState?.start_date) applyDuration(editState.start_date, newDays);
  };

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
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={startEdit}>
          <Pencil className="size-3.5 mr-1" /> Editar
        </Button>
      </div>
    )
  ) : null;


  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title={isLoading ? "Cargando..." : (item?.title ?? "Detalle del item")}
      icon="LayoutList"
      size="2xl"
      modal={false}
      isLoading={isLoading && open}
      childrenFooter={footer}
      onInteractOutside={(e) => {
        // Si el clic fue sobre otra tarjeta/fila/item (tablero, lista,
        // calendario o gantt), no cerramos: el propio onItemClick se
        // encarga de cargar ese item en el mismo sheet. Cualquier otro
        // clic afuera sí cierra normalmente.
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-scrum-item]")) {
          e.preventDefault();
        }
      }}
    >
      {item && !editing && (
        <div className="space-y-8 pb-4">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            <Badge color={TYPE_COLOR[item.type as ScrumItemType]}>
              {TYPE_LABEL[item.type as ScrumItemType]}
            </Badge>
            <Badge color={STATUS_COLOR[item.status as ScrumItemStatus]}>
              {STATUS_LABEL[item.status as ScrumItemStatus]}
            </Badge>
            {priority && (
              <Badge
                variant="outline"
                color={PRIORITY_COLOR[priority]}
                icon={PriorityIcon}
                className="uppercase"
              >
                {priority}
              </Badge>
            )}
            {item.story_points !== undefined && item.story_points !== null && (
              <Badge variant="outline">{item.story_points} pts</Badge>
            )}
          </div>

          {/* Info en dos columnas: label a la izquierda, valor a la derecha */}
          <div>
            {item.project && (
              <InfoRow label="Proyecto">{item.project.name}</InfoRow>
            )}
            {item.sprint && (
              <InfoRow label="Sprint">{item.sprint.name}</InfoRow>
            )}
            {item.assignee && (
              <InfoRow label="Asignado a">
                <span className="inline-flex items-center gap-1.5">
                  <User className="size-3 text-muted-foreground" />
                  {item.assignee.name}
                </span>
              </InfoRow>
            )}
            {item.creator && (
              <InfoRow label="Creador">{item.creator.name}</InfoRow>
            )}
            {item.predecessor && (
              <InfoRow label="Predecesora">{item.predecessor.title}</InfoRow>
            )}
            {item.start_date && (
              <InfoRow label="Fecha inicio">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground" />
                  {item.start_date}
                </span>
              </InfoRow>
            )}
            {item.due_date && (
              <InfoRow label="Fecha fin">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground" />
                  {item.due_date}
                </span>
              </InfoRow>
            )}
            {countDays(item.start_date, item.due_date) !== null && (
              <InfoRow label="Duración">
                {countDays(item.start_date, item.due_date)} día
                {countDays(item.start_date, item.due_date) !== 1 ? "s" : ""}
              </InfoRow>
            )}
            {item.estimated_hours !== undefined &&
              item.estimated_hours !== null && (
                <InfoRow label="Horas estimadas">
                  {item.estimated_hours}h
                </InfoRow>
              )}
            {item.actual_hours !== undefined && item.actual_hours !== null && (
              <InfoRow label="Horas reales">{item.actual_hours}h</InfoRow>
            )}
            {item.tags && item.tags.length > 0 && (
              <InfoRow label="Etiquetas">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      color={tag.color || undefined}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            )}
          </div>

          {/* Recalcular fechas de las tareas hijas */}
          {item.type === "historia" && item.children && item.children.length > 0 && (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <ListTree className="size-4" />
                {item.children.length} tarea{item.children.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={recalculateChildrenMutation.isPending}
                onClick={handleRecalculateChildren}
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Recalcular tiempos de las tareas
              </Button>
            </div>
          )}

          {/* Descripción: al final porque es lo que más se lee */}
          {item.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Descripción
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

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
                      <span className="text-xs text-muted-foreground">
                        {c.created_at}
                      </span>
                    </div>
                    <p className="text-sm mt-0.5 text-muted-foreground">
                      {c.content}
                    </p>
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

          {/* History */}
          {item.history && item.history.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium">Historial</p>
              </div>
              <div className="space-y-2">
                {item.history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {entry.user.name}
                    </span>
                    <span>cambió</span>
                    <span className="font-medium">{entry.field}</span>
                    {entry.old_value && (
                      <>
                        <span>de</span>
                        <span className="bg-red-50 text-red-600 px-1 rounded">
                          {entry.old_value}
                        </span>
                      </>
                    )}
                    {entry.new_value && (
                      <>
                        <span>a</span>
                        <span className="bg-green-50 text-green-600 px-1 rounded">
                          {entry.new_value}
                        </span>
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
              <Select
                value={editState.status}
                onValueChange={(v) => set("status", v)}
              >
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
              <Select
                value={editState.priority}
                onValueChange={(v) => set("priority", v)}
              >
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

            <div className="space-y-1">
              <Label className="text-xs">Fecha inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left font-normal text-sm h-8"
                  >
                    {editState.start_date
                      ? format(parseLocalDate(editState.start_date)!, "dd/MM/yyyy")
                      : "Selecciona la fecha"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    locale={es}
                    mode="single"
                    selected={parseLocalDate(editState.start_date) ?? undefined}
                    defaultMonth={parseLocalDate(editState.start_date) ?? undefined}
                    onSelect={handleStartDateChange}
                    disabled={SUNDAY_DISABLED_MATCHER}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Días</Label>
              <Input
                type="number"
                min={1}
                value={days}
                onChange={(e) => handleDaysChange(e.target.value)}
                className="text-sm h-8"
              />
            </div>

            {editState.due_date && (
              <div className="col-span-2 text-xs text-muted-foreground">
                Termina el {format(parseLocalDate(editState.due_date)!, "dd/MM/yyyy")}
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label className="text-xs">Predecesora</Label>
              <Select
                value={editState.predecessor_id || NO_PREDECESSOR}
                onValueChange={(v) =>
                  set("predecessor_id", v === NO_PREDECESSOR ? "" : v)
                }
              >
                <SelectTrigger className="text-sm h-8">
                  <SelectValue placeholder="Sin predecesora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PREDECESSOR}>Sin predecesora</SelectItem>
                  {predecessorOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      [{TYPE_LABEL[option.type]}] {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground space-y-1">
            {item.project && (
              <p>
                <span className="font-medium">Proyecto:</span>{" "}
                {item.project.name}
              </p>
            )}
            {item.sprint && (
              <p>
                <span className="font-medium">Sprint:</span> {item.sprint.name}
              </p>
            )}
            {item.assignee && (
              <p>
                <span className="font-medium">Asignado a:</span>{" "}
                {item.assignee.name}
              </p>
            )}
          </div>
        </div>
      )}
    </GeneralSheet>
  );
}
