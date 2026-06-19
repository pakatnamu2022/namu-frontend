"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  LayoutDashboard,
  List,
  Calendar,
  GanttChartSquare,
  Filter,
} from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import PageWrapper from "@/shared/components/PageWrapper";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

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

import { KanbanView } from "@/features/gp/tics/pm/scrumItem/components/KanbanView";
import { ListView } from "@/features/gp/tics/pm/scrumItem/components/ListView";
import { CalendarView } from "@/features/gp/tics/pm/scrumItem/components/CalendarView";
import { GanttView } from "@/features/gp/tics/pm/scrumItem/components/GanttView";

type ViewMode = "kanban" | "list" | "calendar" | "gantt";

const VIEWS: { id: ViewMode; label: string; Icon: React.FC<any> }[] = [
  { id: "kanban", label: "Tablero", Icon: LayoutDashboard },
  { id: "list", label: "Lista", Icon: List },
  { id: "calendar", label: "Calendario", Icon: Calendar },
  { id: "gantt", label: "Gantt", Icon: GanttChartSquare },
];

export default function KanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [projectId, setProjectId] = useState<string>("");
  const [sprintId, setSprintId] = useState<string>("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const [ganttFocusId, setGanttFocusId] = useState<number | null>(null);

  const handleFocusInGantt = (id: number) => {
    setViewMode("gantt");
    setGanttFocusId(id);
  };

  const { data: projectsData } = useScrumProjects({ per_page: 100, status: "activo" });
  const projects = projectsData?.data ?? [];

  const resolvedProjectId = projectId ? Number(projectId) : null;
  const { data: allSprints = [] } = useScrumSprints();

  const sprints = resolvedProjectId
    ? allSprints.filter((s) => s.project_id === resolvedProjectId)
    : allSprints;

  const activeSprint = sprints.find((s) => s.status === "activo");

  useEffect(() => {
    if (activeSprint && !sprintId) setSprintId(activeSprint.id.toString());
  }, [activeSprint]);

  useEffect(() => {
    setSprintId("");
  }, [projectId]);

  const resolvedSprintId = sprintId ? Number(sprintId) : null;

  const { data: kanban, isLoading: loadingKanban, refetch } = useScrumKanban(resolvedSprintId);

  const { data: itemsResponse, isLoading: loadingItems } = useScrumItems(
    resolvedSprintId
      ? { sprint_id: resolvedSprintId, per_page: 200 }
      : resolvedProjectId
        ? { project_id: resolvedProjectId, per_page: 200 }
        : { per_page: 200 },
  );
  const listItems = itemsResponse?.data ?? [];

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateScrumItem(id, { status: status as any }),
    onSuccess: () => refetch(),
    onError: () => errorToast("Error al mover el item"),
  });

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
        estimated_hours: data.estimated_hours ? Number(data.estimated_hours) : null,
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

  const projectOptions = projects.map((p) => ({ label: p.name, value: p.id.toString() }));
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
            <div className="flex items-center gap-2">
              <Filter className="size-3.5 text-muted-foreground shrink-0" />
              <SearchableSelect
                value={projectId}
                onChange={setProjectId}
                options={[{ label: "Todos los proyectos", value: "" }, ...projectOptions]}
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

        {/* Views */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 pt-2">
          {viewMode === "kanban" && (
            <KanbanView
              kanban={kanban as any}
              isLoading={loadingKanban}
              onItemClick={setDetailItemId}
              onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
            />
          )}
          {viewMode === "list" && (
            <ListView
              items={listItems}
              isLoading={loadingItems}
              onItemClick={setDetailItemId}
              onFocusInGantt={handleFocusInGantt}
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
              focusItemId={ganttFocusId}
              onFocused={() => setGanttFocusId(null)}
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
          defaultValues={{ project_id: projectId, sprint_id: sprintId, status: "por_hacer" }}
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
