"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bug,
  Minus,
  Zap,
  LayoutDashboard,
  List,
  Calendar,
  GanttChartSquare,
  Filter,
} from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import PageWrapper from "@/shared/components/PageWrapper";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/shared/components/kanban";

import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";
import { useScrumSprints } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.hook";
import {
  useScrumKanban,
  useScrumItems,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.hook";
import {
  storeScrumItem,
  updateScrumItem,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.actions";
import { ItemForm } from "@/features/gp/tics/pm/scrumItem/components/ItemForm";
import { ItemDetailSheet } from "@/features/gp/tics/pm/scrumItem/components/ItemDetailSheet";
import { ScrumItemSchema } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.schema";
import {
  ScrumItemType,
  ScrumItemPriority,
  ScrumKanbanItem,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ListView } from "./_views/ListView";
import { CalendarView } from "./_views/CalendarView";
import { GanttView } from "./_views/GanttView";

type ViewMode = "kanban" | "list" | "calendar" | "gantt";

const VIEWS: { id: ViewMode; label: string; Icon: React.FC<any> }[] = [
  { id: "kanban", label: "Tablero", Icon: LayoutDashboard },
  { id: "list", label: "Lista", Icon: List },
  { id: "calendar", label: "Calendario", Icon: Calendar },
  { id: "gantt", label: "Gantt", Icon: GanttChartSquare },
];

const KANBAN_COLUMNS = [
  {
    id: "backlog",
    name: "Backlog",
    bgColor: "bg-slate-50 dark:bg-slate-900/40",
    textColor: "text-slate-700",
    bgTextColor: "bg-slate-100",
    borderColor: "border-l-slate-300",
  },
  {
    id: "por_hacer",
    name: "Por hacer",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    textColor: "text-blue-700",
    bgTextColor: "bg-blue-100",
    borderColor: "border-l-blue-400",
  },
  {
    id: "en_progreso",
    name: "En progreso",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    textColor: "text-amber-700",
    bgTextColor: "bg-amber-100",
    borderColor: "border-l-amber-400",
  },
  {
    id: "en_revision",
    name: "En revisión",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
    textColor: "text-purple-700",
    bgTextColor: "bg-purple-100",
    borderColor: "border-l-purple-400",
  },
  {
    id: "hecho",
    name: "Hecho",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700",
    bgTextColor: "bg-emerald-100",
    borderColor: "border-l-emerald-400",
  },
] as const;

const TYPE_ICON: Record<ScrumItemType, React.FC<any>> = {
  tarea: Zap,
  historia: Zap,
  funcion: Zap,
  solicitud: AlertTriangle,
  error: Bug,
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

type KanbanStatus =
  | "backlog"
  | "por_hacer"
  | "en_progreso"
  | "en_revision"
  | "hecho";

function ItemCard({
  item,
  onClick,
}: {
  item: ScrumKanbanItem;
  onClick: () => void;
}) {
  const TypeIcon = TYPE_ICON[item.type as ScrumItemType] ?? Zap;
  const priority = item.priority as ScrumItemPriority | undefined;
  const PriorityIcon = priority ? PRIORITY_ICON[priority] : null;

  return (
    <div className="space-y-1.5" onClick={onClick}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <TypeIcon className="size-3 text-muted-foreground shrink-0" />
          <p className="text-xs font-medium line-clamp-2 leading-tight">
            {item.title}
          </p>
        </div>
        {PriorityIcon && priority && (
          <PriorityIcon
            className={cn("size-3 shrink-0 mt-0.5", PRIORITY_COLOR[priority])}
          />
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[9px] px-1 py-0 h-3.5"
              style={
                tag.color
                  ? { borderColor: tag.color, color: tag.color }
                  : undefined
              }
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-1">
        {item.story_points !== undefined && item.story_points !== null && (
          <Badge variant="ghost" className="text-[9px] px-1 py-0 h-3.5">
            {item.story_points}p
          </Badge>
        )}
        {item.assignee && (
          <span className="text-[9px] text-muted-foreground ml-auto truncate">
            {item.assignee.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [projectId, setProjectId] = useState<string>("");
  const [sprintId, setSprintId] = useState<string>("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);

  const { data: projectsData } = useScrumProjects({
    per_page: 100,
    status: "activo",
  });
  const projects = projectsData?.data ?? [];

  const resolvedProjectId = projectId ? Number(projectId) : null;
  const { data: allSprints = [] } = useScrumSprints();

  const sprints = resolvedProjectId
    ? allSprints.filter((s) => s.project_id === resolvedProjectId)
    : allSprints;

  const activeSprint = sprints.find((s) => s.status === "activo");

  useEffect(() => {
    if (activeSprint && !sprintId) {
      setSprintId(activeSprint.id.toString());
    }
  }, [activeSprint]);

  useEffect(() => {
    setSprintId("");
  }, [projectId]);

  const resolvedSprintId = sprintId ? Number(sprintId) : null;

  // Kanban data
  const {
    data: kanban,
    isLoading: loadingKanban,
    refetch,
  } = useScrumKanban(resolvedSprintId);

  // List / Calendar / Gantt data
  const { data: itemsResponse, isLoading: loadingItems } = useScrumItems(
    resolvedSprintId
      ? { sprint_id: resolvedSprintId, per_page: 200 }
      : resolvedProjectId
        ? { project_id: resolvedProjectId, per_page: 200 }
        : { per_page: 200 },
  );
  const listItems = itemsResponse?.data ?? [];

  const allItems: (Omit<ScrumKanbanItem, "id"> & {
    id: string;
    name: string;
    column: string;
  })[] = kanban
    ? KANBAN_COLUMNS.flatMap(({ id: colId }) =>
        (kanban[colId as KanbanStatus] ?? []).map((item) => ({
          ...item,
          id: item.id.toString(),
          name: item.title,
          column: colId,
        })),
      )
    : [];

  const columnCount = (colId: string) =>
    allItems.filter((i) => i.column === colId).length;

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateScrumItem(id, { status: status as any }),
    onSuccess: () => refetch(),
    onError: () => errorToast("Error al mover el item"),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const draggedItem = allItems.find((i) => i.id === active.id);
    if (!draggedItem) return;
    let targetColumn = over.id as string;
    const overItem = allItems.find((i) => i.id === over.id);
    if (overItem) targetColumn = overItem.column;
    if (draggedItem.column === targetColumn) return;
    updateMutation.mutate({ id: Number(draggedItem.id), status: targetColumn });
  };

  const storeMutation = useMutation({
    mutationFn: (data: ScrumItemSchema) =>
      storeScrumItem({
        project_id: Number(data.project_id),
        sprint_id: data.sprint_id ? Number(data.sprint_id) : null,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        story_points: data.story_points ? Number(data.story_points) : null,
        estimated_hours: data.estimated_hours
          ? Number(data.estimated_hours)
          : null,
        due_date: data.due_date || null,
        assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
      }),
    onSuccess: () => {
      successToast("Item creado exitosamente");
      setAddModalOpen(false);
      refetch();
    },
    onError: () => errorToast("Error al crear el item"),
  });

  const projectOptions = projects.map((p) => ({
    label: p.name,
    value: p.id.toString(),
  }));
  const sprintOptions = [
    { label: "Todos los sprints", value: "" },
    ...sprints.map((s) => ({
      label: `${s.name}${s.status === "activo" ? " ★" : ""}`,
      value: s.id.toString(),
    })),
  ];

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("kanban")) notFound();
  if (!currentView) notFound();

  return (
    <>
      <PageWrapper>
        {/* Header */}
        <div className="flex flex-col gap-3 pb-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <TitleComponent
              title={currentView.descripcion}
              subtitle="Gestiona tus tareas al estilo Jira"
              icon={currentView.icon}
            />

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-muted-foreground shrink-0" />
              <SearchableSelect
                value={projectId}
                onChange={setProjectId}
                options={[
                  { label: "Todos los proyectos", value: "" },
                  ...projectOptions,
                ]}
                placeholder="Proyecto"
              />
              <SearchableSelect
                value={sprintId}
                onChange={setSprintId}
                options={sprintOptions}
                placeholder="Sprint"
              />
              {resolvedSprintId && (
                <Button size="sm" onClick={() => setAddModalOpen(true)}>
                  <Plus className="size-3.5 mr-1" /> Item
                </Button>
              )}
            </div>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 w-fit bg-muted/40">
            {VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-2">
          {viewMode === "kanban" && (
            <div className="flex-1 overflow-hidden overflow-x-auto">
              <KanbanProvider
                columns={KANBAN_COLUMNS as any}
                data={allItems as any}
                onDragEnd={handleDragEnd}
                className="h-[calc(100vh-230px)] min-w-[750px] p-0.5"
              >
                {(column: (typeof KANBAN_COLUMNS)[number]) => (
                  <KanbanBoard
                    id={column.id}
                    key={column.id}
                    className="border-none shadow-none"
                  >
                    <KanbanHeader className="border-none">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="ghost"
                          className={cn(
                            "text-xs",
                            column.textColor,
                            column.bgTextColor,
                          )}
                        >
                          {column.name}
                        </Badge>
                        <Badge variant="ghost" className="text-xs">
                          {columnCount(column.id)}
                        </Badge>
                      </div>
                    </KanbanHeader>
                    {loadingKanban ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      <KanbanCards id={column.id}>
                        {(item: any) => (
                          <KanbanCard
                            id={item.id}
                            key={item.id}
                            name={item.name}
                            column={item.column}
                            className={cn(
                              "w-full border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                              column.borderColor,
                            )}
                          >
                            <ItemCard
                              item={item as ScrumKanbanItem}
                              onClick={() => setDetailItemId(Number(item.id))}
                            />
                          </KanbanCard>
                        )}
                      </KanbanCards>
                    )}
                  </KanbanBoard>
                )}
              </KanbanProvider>
            </div>
          )}

          {viewMode === "list" && (
            <ListView
              items={listItems}
              isLoading={loadingItems}
              onItemClick={setDetailItemId}
            />
          )}

          {viewMode === "calendar" && (
            <CalendarView
              items={listItems}
              isLoading={loadingItems}
              onItemClick={setDetailItemId}
            />
          )}

          {viewMode === "gantt" && (
            <GanttView
              sprints={sprints}
              items={listItems}
              isLoading={loadingItems}
              onItemClick={setDetailItemId}
            />
          )}
        </div>
      </PageWrapper>

      <GeneralModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Nuevo item"
        subtitle="Agrega un item al sprint"
        icon="SquareCheckBig"
        size="4xl"
      >
        <ItemForm
          defaultValues={{
            project_id: projectId,
            sprint_id: sprintId,
            status: "por_hacer",
          }}
          onSubmit={storeMutation.mutate}
          onCancel={() => setAddModalOpen(false)}
          isSubmitting={storeMutation.isPending}
          projects={projects}
          sprints={sprints}
        />
      </GeneralModal>

      <ItemDetailSheet
        itemId={detailItemId}
        open={detailItemId !== null}
        onClose={() => setDetailItemId(null)}
      />
    </>
  );
}
