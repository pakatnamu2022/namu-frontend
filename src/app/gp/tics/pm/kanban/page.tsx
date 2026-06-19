"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useScrumKanban } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.hook";
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

const KANBAN_COLUMNS = [
  {
    id: "backlog",
    name: "Backlog",
    bgColor: "bg-slate-50 dark:bg-slate-900/40",
    textColor: "text-slate-700",
    bgTextColor: "bg-slate-100",
    borderColor: "border-l-slate-300",
    shadowColor: "",
  },
  {
    id: "por_hacer",
    name: "Por hacer",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    textColor: "text-blue-700",
    bgTextColor: "bg-blue-100",
    borderColor: "border-l-blue-400",
    shadowColor: "",
  },
  {
    id: "en_progreso",
    name: "En progreso",
    bgColor: "bg-amber-50/50 dark:bg-amber-950/20",
    textColor: "text-amber-700",
    bgTextColor: "bg-amber-100",
    borderColor: "border-l-amber-400",
    shadowColor: "",
  },
  {
    id: "en_revision",
    name: "En revisión",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
    textColor: "text-purple-700",
    bgTextColor: "bg-purple-100",
    borderColor: "border-l-purple-400",
    shadowColor: "",
  },
  {
    id: "hecho",
    name: "Hecho",
    bgColor: "bg-emerald-50/50 dark:bg-emerald-950/20",
    textColor: "text-emerald-700",
    bgTextColor: "bg-emerald-100",
    borderColor: "border-l-emerald-400",
    shadowColor: "",
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
    <div className="space-y-2" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TypeIcon className="size-3.5 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium line-clamp-2 leading-tight">
            {item.title}
          </p>
        </div>
        {PriorityIcon && priority && (
          <PriorityIcon
            className={cn("size-3.5 shrink-0 mt-0.5", PRIORITY_COLOR[priority])}
          />
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4"
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

      <div className="flex items-center justify-between gap-2">
        {item.story_points !== undefined && item.story_points !== null && (
          <Badge variant="ghost" className="text-[10px] px-1.5 py-0 h-4">
            {item.story_points} pts
          </Badge>
        )}
        {item.assignee && (
          <span className="text-[10px] text-muted-foreground ml-auto truncate">
            {item.assignee.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const queryClient = useQueryClient();

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
  const {
    data: kanban,
    isLoading: loadingKanban,
    refetch,
  } = useScrumKanban(resolvedSprintId);

  const allItems: (ScrumKanbanItem & {
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

    updateMutation.mutate({
      id: draggedItem.id as unknown as number,
      status: targetColumn,
    });
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
    { label: "Selecciona un sprint", value: "" },
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
        <HeaderTableWrapper>
          <TitleComponent
            title={currentView.descripcion}
            subtitle="Mueve items entre columnas arrastrando y soltando"
            icon={currentView.icon}
          />
          <div className="flex items-center gap-2 ml-auto">
            <SearchableSelect
              value={projectId}
              onChange={setProjectId}
              options={[
                { label: "Todos los proyectos", value: "" },
                ...projectOptions,
              ]}
              placeholder="Filtrar por proyecto"
            />
            <SearchableSelect
              value={sprintId}
              onChange={setSprintId}
              options={sprintOptions}
              placeholder="Sprint"
            />
            {resolvedSprintId && (
              <Button size="sm" onClick={() => setAddModalOpen(true)}>
                <Plus className="size-4 mr-1" /> Item
              </Button>
            )}
          </div>
        </HeaderTableWrapper>

        <div className="flex-1 overflow-hidden overflow-x-auto">
          <KanbanProvider
            columns={KANBAN_COLUMNS as any}
            data={allItems as any}
            onDragEnd={handleDragEnd}
            className="h-[calc(100vh-200px)] min-w-[900px] p-1"
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
                      className={cn(column.textColor, column.bgTextColor)}
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
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
